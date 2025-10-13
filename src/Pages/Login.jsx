// src/Pages/Login.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Pages/AuthContext";

// смени патека ако сликата е на друго место/име
import loginBg from "../assets/login-bg.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("startup");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/login", { email, password, role });

      if (!res.data?.success) {
        setError(res.data?.message || "Погрешни податоци, пробај пак.");
        return;
      }

      const { user, token } = res.data;
      if (!user || !user._id || !token) {
        setError("Невалиден одговор од сервер.");
        return;
      }

      login(
        { _id: user._id, email: user.email, role: user.role, name: user.name },
        token
      );

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const from =
        location.state?.from?.pathname ||
        (user.role === "startup" ? "/startup-dashboard" : "/mentor-dashboard");

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Погрешни податоци, пробај пак.");
    }
  };

  return (
    <div style={styles.shell} className="login-shell">
      {/* Лева половина: позадинска слика */}
      <div style={{ ...styles.bg, backgroundImage: `url(${loginBg})` }} />

      {/* Десна половина: картичка поместена кон лево */}
      <div style={styles.right}>
        <div style={styles.card} className="login-card">
          <h2 style={styles.title}>Log in to Mentor Token</h2>
          <p style={styles.subtitle}>Enter your email and password to continue.</p>

          {error ? <div style={styles.error}>{error}</div> : null}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Одбирач за улога */}
            <div style={{ marginTop: 2 }}>
              <div style={styles.segment}>
                <button
                  type="button"
                  onClick={() => setRole("startup")}
                  style={{
                    ...styles.segmentBtn,
                    ...(role === "startup" ? styles.segmentBtnActive : {}),
                  }}
                >
                  Startup
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  style={{
                    ...styles.segmentBtn,
                    ...(role === "mentor" ? styles.segmentBtnActive : {}),
                  }}
                >
                  Mentor
                </button>
              </div>
            </div>

            <button type="submit" style={styles.primaryBtn}>
              Log in
            </button>
          </form>

          <div style={styles.footerText}>
            Don’t have an account? <a href="/register">Register</a>
          </div>
        </div>
      </div>

      {/* Responsive: на мобилно картичката да не е поместена */}
      <style>{`
        @media (max-width: 900px){
          .login-shell{ grid-template-columns: 1fr !important; }
          .login-card{ transform:none !important; margin-left:0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;

/* ---------- styles ---------- */

const SHIFT = -400; // ⬅️ помести колку да „влезе“ кон виолетовото (-200 ќе биде уште поблиску)

const styles = {
  shell: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    display: "grid",
    // повеќе простор лево за позадината
    gridTemplateColumns: "minmax(600px, 58%) 1fr",
    background: "#fff",
  },
  bg: {
    backgroundSize: "cover",
    backgroundPosition: "left center",
    backgroundRepeat: "no-repeat",
  },
  right: {
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    padding: "4vh 4vw 4vh 1vw",
  },
  card: {
    width: "100%",
    maxWidth: 820,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 24px 60px rgba(0,0,0,.12)",
    padding: 28,
    // ⬇️ картичката „влегува“ уште повеќе кон лево
    transform: `translateX(${SHIFT}px)`,
  },

  title: { margin: 0, fontSize: 28, fontWeight: 800 },
  subtitle: { margin: "6px 0 20px", color: "#6b7280", fontSize: 14 },

  label: { display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" },
  input: {
    appearance: "none",
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
  },

  segment: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 6,
  },
  segmentBtn: {
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "8px 10px",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 600,
  },
  segmentBtnActive: {
    background: "#6366f1",
    color: "#fff",
    borderColor: "#6366f1",
  },

  primaryBtn: {
    marginTop: 8,
    width: "100%",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },

  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 6,
    fontSize: 14,
  },

  footerText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
  },
};
