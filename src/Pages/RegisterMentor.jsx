// src/Pages/RegisterMentor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/Register_Mentor.png";

export default function RegisterMentor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  // responsive helper
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = vw < 900;

  // avatar preview
  useEffect(() => {
    if (!avatar) { setPreview(""); return; }
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setOk("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("phone", phone);
      fd.append("address", address);
      if (avatar) fd.append("avatar", avatar);

      const res = await axios.post("/register-mentor", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) {
        setError(res.data?.message || "Registration failed");
        return;
      }
      setOk("Mentor registered successfully! You can log in now.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
  }

  // ---- layout tuning ----
  const CARD_WIDTH = 760;
  const CARD_SHIFT = isMobile ? 0 : -250;   // +вредност = надесно (пробај 120–200)
  const BG_SHIFT = 160;                    // позадината малку надесно за да се гледа ракетата

  const wrap = {
    height: "100vh",
    width: "100%",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(700px, 62%) 1fr",
    columnGap: isMobile ? 0 : "48px",
    alignItems: "stretch",
    background: "#fff",
    overflowY: "auto",
  };

  const leftPane = {
    display: isMobile ? "none" : "block",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: `calc(50% + ${BG_SHIFT}px) center`,
  };

  const rightPane = {
    display: "grid",
    placeItems: "center",
    padding: "24px",
  };

  const card = {
    width: `min(${CARD_WIDTH}px, 96vw)`,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 30px 80px rgba(67,56,202,.12), 0 8px 24px rgba(0,0,0,.06)",
    padding: "28px 24px",
    transform: `translateX(${CARD_SHIFT}px)`, // поместување надесно
  };

  const title = {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: 0.3,
    margin: "0 0 14px",
  };

  const label = {
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: 6,
  };

  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
  };

  const row = { display: "grid", gap: 10 };

  const submitBtn = {
    width: "100%",
    marginTop: 8,
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#6366f1 0%, #7c3aed 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  };

  return (
    <div style={wrap}>
      <div style={leftPane} />

      <div style={rightPane}>
        <div style={card}>
          <h2 style={title}>SETUP MENTOR ACCOUNT</h2>

          {/* avatar preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div
              style={{
                width: 84, height: 84, borderRadius: "50%",
                background: "#f3f4f6", overflow: "hidden", flex: "0 0 auto",
                display: "grid", placeItems: "center", border: "1px solid #e6e6e6"
              }}
            >
              {preview ? (
                <img src={preview} alt="avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 12, color: "#888" }}>No image</span>
              )}
            </div>

            <label style={{ display: "block" }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>Profile photo (jpg/png/webp, &lt; 2MB)</div>
              <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
            </label>
          </div>

          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {ok && <div style={{ color: "green", marginBottom: 8 }}>{ok}</div>}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <div style={row}>
              <span style={label}>Mentor Name</span>
              <input style={input} type="text" placeholder="Name and surname" value={name}
                     onChange={(e) => setName(e.target.value)} required />
            </div>

            <div style={row}>
              <span style={label}>Email</span>
              <input style={input} type="email" placeholder="mentor@mail.com" value={email}
                     onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={row}>
              <span style={label}>Password</span>
              <input style={input} type="password" placeholder="••••••••" value={password}
                     onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div style={row}>
              <span style={label}>Phone</span>
              <input style={input} type="tel" placeholder="+389 7x xxx xxx" value={phone}
                     onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div style={row}>
              <span style={label}>Address</span>
              <input style={input} type="text" placeholder="Street, City" value={address}
                     onChange={(e) => setAddress(e.target.value)} />
            </div>

            <button type="submit" style={submitBtn}>Register</button>
          </form>

          <div style={{ marginTop: 12, fontSize: 14 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
