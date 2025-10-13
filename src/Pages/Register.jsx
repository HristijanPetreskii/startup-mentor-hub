// src/Pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/Register_menu.png"; // провери екстензија/патека

export default function Register() {
  const [role, setRole] = useState("startup");
  const navigate = useNavigate();

  // ===== fine-tune knobs =====
  const isMobile   = typeof window !== "undefined" && window.innerWidth < 900;
  const CARD_WIDTH = 680;                 // ⬅️ поширока картичка (px)
  const CARD_SHIFT = isMobile ? 0 : -320; // ⬅️ уште повеќе лево на desktop
  const BG_SHIFT   = 80;                  // по желба: +надесно / −налево на позадината

  const onContinue = () => {
    navigate(role === "startup" ? "/register/startup" : "/register/mentor");
  };

  return (
    <div style={wrap}>
      {/* Left: background image */}
      <div
        style={{
          ...leftPane,
          backgroundImage: `url(${bg})`,
          backgroundPosition: `calc(50% + ${BG_SHIFT}px) center`,
        }}
      />

      {/* Right: card */}
      <div style={rightPane}>
        <div
          style={{
            ...card,
            width: `min(${CARD_WIDTH}px, 96vw)`,
            transform: `translateX(${CARD_SHIFT}px)`,
          }}
        >
          <h2 style={title}>Create your account</h2>
          <p style={subtitle}>Choose your account type to continue.</p>

          <div style={switchWrap}>
            <button
              type="button"
              onClick={() => setRole("startup")}
              style={{ ...pillBtn, ...(role === "startup" ? pillActive : {}) }}
            >
              Startup
            </button>
            <button
              type="button"
              onClick={() => setRole("mentor")}
              style={{ ...pillBtn, ...(role === "mentor" ? pillActive : {}) }}
            >
              Mentor
            </button>
          </div>

          {/* preview inputs (UI only) */}
          <div style={ghostWrap}>
            <input style={ghostInput} disabled placeholder="Email (preview)" />
            <input style={ghostInput} disabled placeholder="Password (preview)" />
          </div>

          <button type="button" onClick={onContinue} style={primaryBtn}>
            Continue
          </button>

          <p style={small}>
            Already have an account?{" "}
            <Link to="/login" style={link}>Login</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const wrap = {
  height: "100vh",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(620px, 60%) 1fr", // простор за позадината
  alignItems: "stretch",
};

const leftPane = {
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  height: "100%",
};

const rightPane = {
  display: "grid",
  placeItems: "center",
  padding: "24px",
};

const card = {
  background: "#fff",
  borderRadius: 18,
  padding: "46px 40px 33px", // поголемо внатрешно растојание
  boxShadow:
    "0 22px 70px rgba(0,0,0,.08), 0 10px 24px rgba(99,102,241,.10), inset 0 1px #fff",
};

const title = { margin: 0, fontSize: 28, fontWeight: 800, color: "#1f2937" };
const subtitle = { margin: "10px 0 20px", color: "#6b7280", fontSize: 14 };

const switchWrap = { display: "flex", gap: 10, marginBottom: 16 };
const pillBtn = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  fontWeight: 600,
  cursor: "pointer",
};
const pillActive = {
  background: "linear-gradient(180deg,#6366f1,#4f46e5)",
  color: "#fff",
  borderColor: "transparent",
  boxShadow: "0 8px 18px rgba(99,102,241,.28)",
};

const ghostWrap = { display: "grid", gap: 12, margin: "10px 0 18px" };
const ghostInput = {
  padding: "13px 15px",
  borderRadius: 12,
  border: "1px dashed #e5e7eb",
  background: "#f9fafb",
  color: "#94a3b8",
  fontSize: 14,
};

const primaryBtn = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  background: "linear-gradient(180deg,#6366f1,#4f46e5)",
  color: "#fff",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 12px 22px rgba(79,70,229,.28)",
};

const small = { marginTop: 12, fontSize: 13, color: "#6b7280", textAlign: "center" };
const link = { color: "#4f46e5", fontWeight: 700, textDecoration: "none" };
