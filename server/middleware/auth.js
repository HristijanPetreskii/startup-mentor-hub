const jwt = require("jsonwebtoken");
const UserModel = require("../models/User"); // За mentors
const StartupModel = require("../models/Startup"); // За startups

const authenticateUser = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Треба да биде "Bearer TOKEN"
    if (!token) return res.status(401).json({ success: false, message: "Invalid token format" });

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        console.log("Decoded Token:", decoded); // Додај за дебагирање

        // Проверка дали корисникот е mentor (User) или startup (Startup)
        let user = await UserModel.findById(decoded._id);
        if (!user) {
            user = await StartupModel.findById(decoded._id); // Ако не е mentor, провери дали е startup
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = {
            _id: user._id,
            email: user.email,
            role: user.role || "startup", // Ако е mentor, земи role; ако е startup, подразбирај "startup"
        };

        console.log("Authenticated User:", req.user); // Видете дали има role
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

module.exports = authenticateUser;
