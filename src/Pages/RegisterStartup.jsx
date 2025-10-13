// src/Pages/RegisterStartup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/Register_Startup.png";

export default function RegisterStartup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    representative: "", address: "", inviteEmails: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const set = (k,v)=>setForm(s=>({...s,[k]:v}));

  async function onSubmit(e){
    e.preventDefault(); setErr(""); setOk(""); setLoading(true);
    try{
      await axios.post("/register", {
        role:"startup",
        name:form.name, email:form.email, password:form.password,
        representative:form.representative, address:form.address,
      });
      setOk("Registration successful! Please log in.");
      setTimeout(()=>nav("/login"), 900);
    }catch(e){ setErr(e.response?.data?.message || "Server error"); }
    finally{ setLoading(false); }
  }

  return (
    <div className="rs-shell">
      <style>{`
        .rs-shell{
          --ink:#111; --muted:#6b7280; --accent:#6d5efc;
          /* поширока површина за арт + поголемо преклопување */
          --artW: clamp(700px, 66vw, 1040px);
          --overlapX: clamp(340px, 24vw, 560px);
          background:#f8fafc; min-height:100vh; color:var(--ink);
          display:grid; grid-template-columns: minmax(320px, var(--artW)) 1fr;
        }
        /* туркај уште полево на поголеми екрани */
        @media (min-width: 1280px){ .rs-shell{ --overlapX: 520px; } }
        @media (min-width: 1536px){ .rs-shell{ --overlapX: 600px; } }

        .rs-art{
          position:relative; min-height:100vh; overflow:hidden;
          background-image:url("/src/assets/Register_Startup.png");
          background-size:cover; background-position:center left;
        }
        .rs-art::after{
          content:""; position:absolute; inset:0;
          background: linear-gradient(90deg,
            rgba(255,255,255,.00) 38%,
            rgba(255,255,255,.08) 58%,
            rgba(255,255,255,.16) 100%);
          pointer-events:none;
        }

        .rs-main{ display:grid; place-items:center; padding:32px 18px; }
        .rs-float{
          width:100%; max-width:560px;
          transform: translateX(calc(-1 * var(--overlapX)));
        }

        .card{ background:#fff; border:1px solid #e5e7eb; border-radius:16px;
               padding:22px 20px; box-shadow:0 6px 22px rgba(17,24,39,.08); }
        .title{ font-size:28px; font-weight:900; line-height:1.1; margin:0 0 4px; }
        .subtitle{ color:var(--muted); margin:0 0 16px; }

        form{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        form .full{ grid-column:1 / -1; }
        label{ font-size:12px; color:var(--muted); margin-bottom:6px; display:block; }
        input{ width:100%; padding:12px 14px; border:1px solid #e5e7eb; border-radius:12px; outline:none; }
        input:focus{ border-color:#c7d2fe; box-shadow:0 0 0 3px rgba(99,102,241,.15); }

        .primary{ grid-column:1 / -1; margin-top:6px; background:#5b53fb; color:#fff;
                  font-weight:800; border:none; border-radius:12px; padding:12px 16px; cursor:pointer; }
        .primary:disabled{ opacity:.7; cursor:not-allowed; }
        .subtext{ font-size:12px; color:var(--muted); text-align:center; }

        @media (max-width: 980px){
          .rs-shell{ grid-template-columns:1fr; }
          .rs-art{ min-height:40vh; }
          .rs-main{ padding:16px 12px; }
          .rs-float{ transform:none; max-width:620px; }
          form{ grid-template-columns:1fr; }
        }
      `}</style>

      <div className="rs-art" />

      <div className="rs-main">
        <div className="rs-float">
          <div className="card">
            <h1 className="title">SETUP STARTUP<br/>ACCOUNT</h1>
            <p className="subtitle">Monitoring and evaluating now is easy!</p>

            {err && <p style={{color:"#d92d20", marginTop:0}}>{err}</p>}
            {ok  && <p style={{color:"#16a34a", marginTop:0}}>{ok}</p>}

            <form onSubmit={onSubmit}>
              <div className="full">
                <label>Startup Name</label>
                <input placeholder="My Startup Name" value={form.name}
                  onChange={e=>set("name", e.target.value)} required />
              </div>

              <div>
                <label>Email</label>
                <input type="email" placeholder="startup@mail.com" value={form.email}
                  onChange={e=>set("email", e.target.value)} required />
              </div>
              <div>
                <label>Password</label>
                <input type="password" placeholder="Min. 8 characters" minLength={8}
                  value={form.password} onChange={e=>set("password", e.target.value)} required />
              </div>

              <div className="full">
                <label>Legal Representative *</label>
                <input placeholder="Name and surname" value={form.representative}
                  onChange={e=>set("representative", e.target.value)} required />
              </div>

              <div className="full">
                <label>Registered Business Address *</label>
                <input placeholder="Registered Business Address" value={form.address}
                  onChange={e=>set("address", e.target.value)} required />
              </div>

              <div className="full">
                <label>Invite Mentors via email (comma separated)</label>
                <input placeholder="mentor1@mail.com, mentor2@mail.com"
                  value={form.inviteEmails} onChange={e=>set("inviteEmails", e.target.value)} />
              </div>

              <button type="submit" className="primary" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="subtext" style={{marginTop:10}}>
              By signing up you accept Company's Terms of Use & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
