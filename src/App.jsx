// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

/* Pages */
import Home from "./Pages/home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Header from "./Pages/Header";
import Footer from "./Pages/Footer";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import RegisterStartup from "./Pages/RegisterStartup";
import RegisterMentor from "./Pages/RegisterMentor";

import Profile from "./Pages/Profile";
import Mentor from "./Pages/Mentor";
import Startup from "./Pages/Startup";            // Startup dashboard (Figma)
import Mentor_page from "./Pages/Mentor_page";
import MentorDashboard from "./Pages/mentorDashboard";
import MentorJob from "./Pages/mentorJob";
import MentorStats from "./Pages/mentorStats";
import StartupMentors from "./Pages/StartupMentors";
import MentorJobFeed from "./Pages/MentorJobFeed";

/* Jobs */
import CreateJob from "./Pages/createJobs";
import JobList from "./Pages/JobList";
import MentorList from "./Pages/MentorList";
import JobOfferPage from "./Pages/JobOfferPage";
import JobDetails from "./Pages/JobDetails";
import Navbar from "./Pages/Navbar";
import AppliedJobs from "./Pages/AppliedJobs";
import JobCard from "./Pages/JobCard";

/* Startup → Jobs листа */
import StartupJobs from "./Pages/StartupJobs";

/* Auth */
import AuthProvider from "./Pages/AuthContext";
import ProtectedRoute from "./Pages/ProtectedRoute";

/* Layout: условно крие Header/Footer */
function Shell({ children }) {
  const location = useLocation();

  // страници каде не сакаме header/footer
  const AUTH_ONLY = ["/login", "/register", "/register/startup", "/register/mentor"];
  const MENTOR_MINIMAL = ["/mentor-dashboard", "/mentorstats", "/mentor/job-feed","/startup-dashboard","/job-offer/:mentorId","/startup/jobs","/createjob","/startup-mentors"];

  const hideChrome = [...AUTH_ONLY, ...MENTOR_MINIMAL]
    .some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!hideChrome && <Header />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            {/* Главна страна без авто-redirect */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/startup" element={<RegisterStartup />} />
            <Route path="/register/mentor" element={<RegisterMentor />} />

            {/* Dashboards */}
            <Route
              path="/startup-dashboard"
              element={
                <ProtectedRoute allow={["startup"]}>
                  <Startup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor-dashboard"
              element={
                <ProtectedRoute allow={["mentor"]}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Startup функционален дел */}
            <Route
              path="/startup/jobs"
              element={
                <ProtectedRoute allow={["startup"]}>
                  <StartupJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/createjob"
              element={
                <ProtectedRoute allow={["startup"]}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/startup-mentors"
              element={
                <ProtectedRoute allow={["startup"]}>
                  <StartupMentors />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/job-feed"
              element={
                <ProtectedRoute allow={["mentor"]}>
                  <MentorJobFeed />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentorstats"
              element={
                <ProtectedRoute allow={["mentor"]}>
                  <MentorStats />
                </ProtectedRoute>
              }
            />

            {/* Остаток */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/mentorpage" element={<Mentor_page />} />
            <Route path="/mentorjob" element={<MentorJob />} />

            <Route path="/jobList" element={<JobList />} />
            <Route path="/mentors" element={<MentorList />} />
            <Route path="/navbar" element={<Navbar />} />
            <Route path="/job-offer/:mentorId" element={<JobOfferPage />} />
            <Route
              path="/job/:jobId"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/appliedjobs" element={<AppliedJobs />} />
            <Route path="/jobCart" element={<JobCard />} />

            {/* Удобен redirect ако некаде користиш /startup */}
            <Route
              path="/startup"
              element={<Navigate to="/startup-dashboard" replace />}
            />

            {/* Fallback: НЕ редиректира на "/" (за да избегнеме loop) */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthProvider>
  );
}
