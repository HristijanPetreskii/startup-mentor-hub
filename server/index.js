// server/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 📦 за upload
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();

/* ====== CONFIG ====== */
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/semos_project";
const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_env";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch((e) => console.error("Mongo error:", e));

/* ====== MODELS ====== */
const MentorModel       = require("./models/mentor");
const StartupModel      = require("./models/Startup");
const JobModel          = require("./models/job");
const JobOfferModel     = require("./models/JobOffer");
const Application       = require("./models/Application");
const MentorPerformance = require("./models/MentorPerformance");

/* ====== 📸 Multer /uploads setup ====== */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, "uploads", "avatars");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// статички сервирај ги качените слики
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ====== AUTH MIDDLEWARE ====== */
function authenticateUser(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // {_id, email, role}
    next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}

/* ====== AUTH ====== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, address, representative } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!["mentor", "startup"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const normalizedEmail = email.toLowerCase();
    const exists =
      (await MentorModel.findOne({ email: normalizedEmail })) ||
      (await StartupModel.findOne({ email: normalizedEmail }));
    if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    let user;
    if (role === "mentor") {
      user = new MentorModel({ name, email: normalizedEmail, password: hashed, role: "mentor" });
    } else {
      user = new StartupModel({
        name,
        email: normalizedEmail,
        password: hashed,
        role: "startup",
        address: address || "",
        representative: representative || "",
        jobsPosted: [],
      });
    }

    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = (email || "").toLowerCase();

    let user =
      role === "mentor"
        ? await MentorModel.findOne({ email: normalizedEmail })
        : role === "startup"
        ? await StartupModel.findOne({ email: normalizedEmail })
        : null;

    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { _id: user._id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ====== DIRECTORY ====== */
app.get("/mentors", async (_req, res) => {
  try {
    const mentors = await MentorModel.find().select("-password");
    res.json(mentors);
  } catch {
    res.status(500).json({ message: "Error fetching mentors" });
  }
});

app.get("/startups", async (_req, res) => {
  try {
    const startups = await StartupModel.find().select("_id name email");
    res.json({ success: true, startups });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/startups/:id", async (req, res) => {
  try {
    const startup = await StartupModel.findById(req.params.id).populate("jobsPosted");
    if (!startup) return res.status(404).json({ message: "Startup not found" });
    res.json(startup);
  } catch {
    res.status(500).json({ error: "Failed to fetch startup" });
  }
});

/* ====== JOBS ====== */
// сите jobs (јавна)
app.get("/jobs", async (_req, res) => {
  try {
    const jobs = await JobModel.find().populate("companyId", "name");
    res.json({ success: true, jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// get single mentor
app.get("/mentors/:id", async (req, res) => {
  try {
    const m = await MentorModel.findById(req.params.id).select("-password");
    if (!m) return res.status(404).json({ success:false, message:"Mentor not found" });
    res.json({ success:true, mentor: m });
  } catch {
    res.status(500).json({ success:false, message:"Server error" });
  }
});

// моите jobs (само за најавен startup)
app.get("/my-jobs", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "startup") {
      return res.status(403).json({ success: false, message: "Only startups can see their jobs" });
    }
    const jobs = await JobModel.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// jobs по startupId (ако ти треба јавно)
app.get("/startups/:startupId/jobs", async (req, res) => {
  try {
    const jobs = await JobModel.find({ companyId: req.params.startupId });
    res.json({ success: true, jobs });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching jobs" });
  }
});

// креирање job (само startup)
app.post("/create-job", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "startup") {
      return res.status(403).json({ success: false, message: "Only startups can create jobs" });
    }

    let { title, description, skillsRequired, status } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    // прифати CSV или низа за skills
    if (typeof skillsRequired === "string") {
      skillsRequired = skillsRequired.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(skillsRequired)) skillsRequired = [];
    if (!status) status = "open";

    const startup = await StartupModel.findById(req.user._id);
    if (!startup) return res.status(404).json({ success: false, message: "Startup not found" });

    const job = await JobModel.create({
      companyId: req.user._id,
      title,
      description,
      skillsRequired,
      status,
    });

    await StartupModel.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { jobsPosted: job._id } }
    );

    res.status(201).json({ success: true, message: "Job created successfully", job });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ====== JOB OFFERS ====== */
app.post("/offer-job", async (req, res) => {
  try {
    const { jobId, startupId, mentorId, shortName, description } = req.body;
    if (!jobId || !startupId || !mentorId || !shortName || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const jobOffer = await JobOfferModel.create({
      jobId, startupId, mentorId, shortName, description, status: "pending",
    });
    res.status(201).json({ success: true, message: "Job offer created successfully", jobOffer });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/respond-job-offer", async (req, res) => {
  try {
    const { offerId, response } = req.body;
    if (!offerId || !["inprogress", "rejected"].includes(response)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const offer = await JobOfferModel.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: "Job offer not found" });
    if (offer.status !== "pending") {
      return res.status(400).json({ success: false, message: "Offer already processed/cancelled" });
    }
    offer.status = response;
    await offer.save();
    res.json({ success: true, jobOffer: offer });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/cancel-job-offer", async (req, res) => {
  try {
    const { offerId } = req.body;
    const offer = await JobOfferModel.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });
    if (offer.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot cancel processed offer" });
    }
    offer.status = "cancelled";
    await offer.save();
    res.json({ success: true, jobOffer: offer });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ====== APPLICATIONS ====== */
app.post("/apply", async (req, res) => {
  try {
    const { mentorId, jobId } = req.body;
    const exists = await Application.findOne({ mentorId, jobId });
    if (exists) return res.status(400).json({ message: "You have already applied for this job" });

    await Application.create({ mentorId, jobId, status: "Pending" });
    res.status(201).json({ message: "Application sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/applications/:mentorId", async (req, res) => {
  try {
    const applications = await Application.find({ mentorId: req.params.mentorId }).populate("jobId");
    const formatted = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      jobTitle: app.jobId?.title,
      jobDescription: app.jobId?.description,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// List all job offers for the logged-in startup
app.get("/my-offers", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "startup") {
      return res.status(403).json({ success: false, message: "Only startups can see their offers" });
    }
    const offers = await JobOfferModel.find({ startupId: req.user._id })
      .populate("mentorId", "name email")
      .populate("jobId", "title status");

    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/applications/:applicationId/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "In Progress", "Done", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Application not found" });

    // ако е завршено, апдејтирај перформанси
    if (status === "Done") {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      let perf = await MentorPerformance.findOne({ mentorId: updated.mentorId });
      if (!perf) {
        perf = await MentorPerformance.create({
          mentorId: updated.mentorId,
          completedJobs: 0,
          monthlyCompletedJobs: {},
        });
      }
      perf.completedJobs += 1;
      if (perf.monthlyCompletedJobs.set) {
        perf.monthlyCompletedJobs.set(
          currentMonth,
          (perf.monthlyCompletedJobs.get(currentMonth) || 0) + 1
        );
      } else {
        perf.monthlyCompletedJobs[currentMonth] =
          (perf.monthlyCompletedJobs[currentMonth] || 0) + 1;
      }
      await perf.save();
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ====== PERFORMANCE ====== */
app.get("/top-mentors", async (_req, res) => {
  try {
    const topMentors = await MentorPerformance.find()
      .sort({ completedJobs: -1 })
      .limit(5);
    res.status(200).json(topMentors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/mentor-performance/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const year = new Date().getFullYear().toString();

    const perf = await MentorPerformance.findOne({ mentorId });
    if (!perf) return res.status(404).json({ message: "Performance data not found" });

    const source = perf.monthlyCompletedJobs?.get
      ? Object.fromEntries(perf.monthlyCompletedJobs)
      : perf.monthlyCompletedJobs || {};

    const monthlyData = Object.keys(source)
      .filter((k) => k.startsWith(year))
      .map((k) => ({ month: k, completedJobs: source[k] }));

    res.status(200).json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ====== REGISTER MENTOR (multipart/form-data) ====== */
app.post("/register-mentor", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const normalizedEmail = (email || "").toLowerCase();
    const exists =
      (await MentorModel.findOne({ email: normalizedEmail })) ||
      (await StartupModel.findOne({ email: normalizedEmail }));
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : "";

    const user = await MentorModel.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: "mentor",
      phone: phone || "",
      address: address || "",
      avatarUrl,
    });

    res.json({
      success: true,
      message: "Mentor registered successfully",
      user: { _id: user._id, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    console.error("Register-mentor error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

// GET /mentor-offers/:mentorId  -> offers на овој ментор (pending/inprogress/...)
app.get("/mentor-offers/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;

    const offers = await JobOfferModel.find({ mentorId })
      .populate("jobId", "title status description skillsRequired")
      .populate("startupId", "name email");

    res.json({ success: true, offers });
  } catch (err) {
    console.error("mentor-offers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/respond-job-offer", async (req, res) => {
  try {
    const { offerId, response } = req.body;
    if (!offerId || !["inprogress", "rejected"].includes(response)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const offer = await JobOfferModel.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: "Job offer not found" });
    if (offer.status !== "pending") {
      return res.status(400).json({ success: false, message: "Offer already processed/cancelled" });
    }

    offer.status = response;
    await offer.save();

    // ако прифати -> осигурај Application со "In Progress"
    if (response === "inprogress") {
      const found = await Application.findOne({ mentorId: offer.mentorId, jobId: offer.jobId });
      if (!found) {
        await Application.create({ mentorId: offer.mentorId, jobId: offer.jobId, status: "In Progress" });
      } else if (found.status !== "In Progress") {
        found.status = "In Progress";
        await found.save();
      }
    }

    res.json({ success: true, jobOffer: offer });
  } catch (err) {
    console.error("respond-job-offer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



/* ====== START ====== */
app.listen(PORT, () => {
  console.log(`🚀 server running on http://localhost:${PORT}`);
});
