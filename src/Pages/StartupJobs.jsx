// src/Pages/StartupJobs.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import tokenIcon from "../assets/ic_outline-token.png";

export default function StartupJobs() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openJob, setOpenJob] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3001/my-jobs", { headers });
        if (!cancelled) setJobs(res.data?.jobs ?? res.data ?? []);
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || e.message || "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(j => {
      const skillsStr = Array.isArray(j.skillsRequired)
        ? j.skillsRequired.join(" ")
        : (j.skillsRequired || "");
      return (
        (j.title || "").toLowerCase().includes(q) ||
        (j.description || "").toLowerCase().includes(q) ||
        skillsStr.toLowerCase().includes(q)
      );
    });
  }, [jobs, query]);

  const isActive = (p) => location.pathname === p;
  const chipName = user?.companyName || user?.name || user?.email || "Startup";
  const chipInitial = chipName?.charAt(0)?.toUpperCase?.() || "S";

  if (loading) return <div style={{ padding: 16, color: "#111" }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  return (
    <div className="su-wrap">
      <style>{`
        .su-wrap{--accent:#6366f1;--ink:#111;--muted:#6b7280;background:#f8fafc;min-height:100vh}
        .su-wrap,.su-wrap *{color:var(--ink)!important;box-sizing:border-box}

        .su-layout{display:grid;grid-template-columns:280px 1fr;max-width:1280px;margin:0 auto;min-height:100vh}

        .su-side{
          position:sticky; top:0; height:100vh;
          background:#fff;border-right:1px solid #eef2f7;
          padding:18px 16px;
          display:flex;flex-direction:column;gap:14px;
        }
        .brand{
          display:flex;align-items:center;gap:10px;
          font-weight:800;letter-spacing:.2px;font-size:18px;
          padding:6px 8px
        }
        .brand img{width:28px;height:28px}

        .nav{display:flex;flex-direction:column;gap:8px;margin-top:6px;padding-right:4px}
        .navitem{
          position:relative;
          display:grid;grid-template-columns:26px 1fr;align-items:center;gap:12px;
          font-size:16px;font-weight:700;
          padding:12px 14px;border-radius:12px;
          color:#374151!important;cursor:pointer;border:1px solid transparent;text-decoration:none
        }
        .navitem:hover{background:#f3f4ff}
        .navitem.active{background:#ecebff;color:#3f46d8!important;border:1px solid #cbd5ff}
        .navitem.active::after{content:"";position:absolute;right:-6px;top:6px;bottom:6px;width:3px;background:var(--accent);border-radius:4px}
        .navitem .icon{width:24px;height:24px;display:inline-grid;place-items:center}

        .logout{
          margin-top:auto;
          color:#3b82f6!important;font-weight:700;border:none;background:none;cursor:pointer;
          padding:10px 12px;border-radius:10px;font-size:15px
        }

        .su-main{padding:20px}
        .topbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .search{width:360px;max-width:100%;padding:10px 12px;border-radius:12px;border:1px solid #e5e7eb;background:#fff}
        .chip{margin-left:auto;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:6px 10px}
        .chip .av{width:28px;height:28px;border-radius:50%;background:#eef2ff;display:grid;place-items:center;font-weight:800;color:#3f46d8!important}

        .headrow{display:flex;align-items:center;gap:12px;margin:6px 0 16px}
        .cta{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:10px;background:#7c3aed;color:#fff;text-decoration:none;border:none;cursor:pointer}

        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
        .card{border:1px solid #eee;border-radius:14px;padding:16px;background:#fff;display:flex;flex-direction:column}
        .company{font-size:13px;color:var(--muted)!important;margin-bottom:4px}
        .desc{margin:0 0 8px;font-size:14px;line-height:1.4}
        .skills{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
        .pill{font-size:12px;background:#f2f4ff;border:1px solid #e5e8ff;padding:4px 8px;border-radius:999px}
        .rowBtn{display:flex;justify-content:flex-end;margin-top:8px}
        .btn{padding:8px 12px;border-radius:10px;border:1px solid #cbd5ff;background:#eef2ff;color:#3f46d8!important;font-weight:700;cursor:pointer}
      `}</style>

      <div className="su-layout">
        {/* LEFT: Sidebar */}
        <aside className="su-side">
          <div className="brand">
            <img src={tokenIcon} alt="token" />
            <span>Mentor Token</span>
          </div>

          <nav className="nav">
            <Link to="/startup-dashboard" className={`navitem ${isActive("/startup-dashboard") ? "active" : ""}`}>
              <span className="icon"><GridIcon/></span>
              <span>Dashboard</span>
            </Link>
            <Link to="/startup-mentors" className={`navitem ${isActive("/startup-mentors") ? "active" : ""}`}>
              <span className="icon"><UsersIcon/></span>
              <span>Mentors</span>
            </Link>
            <Link to="/startup/jobs" className={`navitem ${isActive("/startup/jobs") ? "active" : ""}`}>
              <span className="icon"><BriefcaseIcon/></span>
              <span>Jobs</span>
            </Link>
          </nav>

          <button
            className="logout"
            onClick={() => {
              logout?.();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </aside>

        {/* RIGHT: Main */}
        <main className="su-main">
          {/* Top bar */}
          <div className="topbar">
            <input
              className="search"
              placeholder="Search Mentor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chip">
              <div className="av">{chipInitial}</div>
              <div>{chipName}</div>
            </div>
          </div>

          <div className="headrow">
            <h2 style={{ margin: 0 }}>Your Startup Jobs</h2>
            <button className="cta" onClick={() => navigate("/createjob")}>+ Create New Job</button>
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ borderStyle: "dashed", color: "#6b7280" }}>
              No jobs match your search. Click “Create New Job”.
            </div>
          ) : (
            <div className="grid">
              {filtered.map((job) => (
                <article key={job._id} className="card">
                  <div className="company">{job.companyId?.name || "Your Company"}</div>
                  <h3 style={{ margin: "0 0 6px" }}>{job.title || "Job"}</h3>
                  <p className="desc">
                    {(job.description || "").slice(0, 140)}
                    {(job.description || "").length > 140 ? "…" : ""}
                  </p>

                  {Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
                    <div className="skills">
                      {job.skillsRequired.slice(0, 5).map((s, i) => (
                        <span key={i} className="pill">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="rowBtn">
                    {/* KEY FIX: open on next tick to avoid immediate close from same click */}
                    <button className="btn" onClick={() => setTimeout(() => setOpenJob(job), 0)}>View More</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {openJob && (
        <Modal onClose={() => setOpenJob(null)}>
          <StartupJobDetails job={openJob} />
        </Modal>
      )}
    </div>
  );
}

/* ================= Modal (Portal + inline styles + body lock) ================= */
function Modal({ children, onClose }) {
  // lock background scroll + Esc to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // close only when clicking the backdrop itself (outside the card)
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      onMouseDown={handleBackdropMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,.38)",
        backdropFilter: "blur(8px) saturate(110%)",
        WebkitBackdropFilter: "blur(8px) saturate(110%)",
        zIndex: 2147483647,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "10vh 16px",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(92vw, 640px)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 14,
          padding: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,.22)",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            fontSize: 22,
            lineHeight: 1,
            border: "none",
            background: "transparent",
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ================= Details content ================= */
function StartupJobDetails({ job = {} }) {
  const statusStyle = statusColors(job.status || "");
  const skills =
    Array.isArray(job.skillsRequired)
      ? job.skillsRequired
      : typeof job.skillsRequired === "string" && job.skillsRequired.trim()
      ? job.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
      : [];

  const applicants =
    Array.isArray(job.applicants) ? job.applicants :
    Array.isArray(job.applications) ? job.applications :
    Array.isArray(job.appliedMentors) ? job.appliedMentors : [];

  const created = job.createdAt ? new Date(job.createdAt) : null;

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#eef2ff", display: "grid", placeItems: "center",
            fontWeight: 800, color: "#3730a3"
          }}
        >
          {(job.title || "J").charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {job.companyId?.name || "Your Company"}
          </div>
          <h3 style={{ margin: "2px 0 0", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.title || "Job"}
          </h3>
        </div>

        <span
          className="status"
          style={{
            border: "1px solid",
            borderColor: statusStyle.borderColor,
            background: statusStyle.background,
            color: statusStyle.color,
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700
          }}
        >
          {labelizeStatus(job.status || "")}
        </span>
      </div>

      {created && (
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Created: {created.toLocaleDateString()}
        </div>
      )}

      <div style={{ height: 1, background: "#eef2f7", margin: "12px 0" }} />

      {/* Description */}
      <div style={{ marginBottom: 6, fontWeight: 700 }}>Job Description</div>
      <p style={{ lineHeight: 1.6, marginTop: 4 }}>
        {job.description || "No description."}
      </p>

      {/* Skills */}
      {!!skills.length && (
        <>
          <div style={{ height: 1, background: "#eef2f7", margin: "12px 0" }} />
          <div style={{ marginBottom: 6, fontWeight: 700 }}>Required Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((s, i) => (
              <span key={i} style={{
                fontSize: 12, background: "#f2f4ff", border: "1px solid #e5e8ff",
                padding: "4px 8px", borderRadius: 999
              }}>{s}</span>
            ))}
          </div>
        </>
      )}

      {/* Applicants */}
      <div style={{ height: 1, background: "#eef2f7", margin: "12px 0" }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight: 700 }}>Applicants</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
        </div>
      </div>

      {applicants.length === 0 ? (
        <div style={{ fontSize: 12, color: "#6b7280", opacity: .75 }}>No one has applied yet.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {applicants.slice(0, 16).map((a, i) => (
            <div
              key={a?._id || a?.id || i}
              title={a?.name || a?.email || "Applicant"}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#eef2ff", display: "grid", placeItems: "center",
                fontSize: 12, fontWeight: 700, color: "#3f46d8"
              }}
            >
              {(a?.name || a?.email || "?").charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= helpers ================= */
function labelizeStatus(s = "") {
  const v = s.toLowerCase();
  if (v === "inprogress") return "IN PROGRESS";
  return v.toUpperCase();
}
function statusColors(s = "") {
  const v = s.toLowerCase();
  if (v === "done")       return { background: "#e8faf0", color: "#0f766e", borderColor: "#99f6e4" };
  if (v === "rejected")   return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (v === "inprogress") return { background: "#eef2ff", color: "#3730a3", borderColor: "#c7d2fe" };
  return { background: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" };
}

/* ====== Tiny sidebar icons ====== */
function GridIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6"/>
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6"/>
    </svg>
  );
}
function UsersIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" stroke="#4f46e5" strokeWidth="1.6"/>
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14.5 18a5 5 0 0 1 7 0" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function BriefcaseIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="#4f46e5" strokeWidth="1.6"/>
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#4f46e5" strokeWidth="1.6"/>
      <path d="M3 12h18" stroke="#4f46e5" strokeWidth="1.6"/>
    </svg>
  );
}
