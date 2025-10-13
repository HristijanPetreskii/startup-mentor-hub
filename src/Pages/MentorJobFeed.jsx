// src/Pages/MentorJobFeed.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import TokenIcon from "../assets/ic_outline-token.png"; // 60x60

export default function MentorJobFeed() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openJob, setOpenJob] = useState(null);
  const [applied, setApplied] = useState(() => new Set());

  const [showFilters, setShowFilters] = useState(false);
  const [skillFilters, setSkillFilters] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3001/jobs");
        const all = (res.data?.jobs || []).filter(
          (j) => (j.status || "open").toLowerCase() === "open"
        );
        if (!cancelled) setJobs(all);
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    (jobs || []).forEach((j) => {
      const c = (j.category || j.industry || "").trim();
      if (c) set.add(c);
    });
    return ["all", ...Array.from(set)];
  }, [jobs]);

  const allSkills = useMemo(() => {
    const set = new Set();
    (jobs || []).forEach((j) => {
      const arr = Array.isArray(j.skillsRequired)
        ? j.skillsRequired
        : typeof j.skillsRequired === "string"
          ? j.skillsRequired.split(/,|\n|;|•|-/).map(s => s.trim()).filter(Boolean)
          : [];
      arr.forEach((s) => s && set.add(s));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = jobs;

    if (q) {
      out = out.filter((j) => {
        const arr = Array.isArray(j.skillsRequired)
          ? j.skillsRequired
          : typeof j.skillsRequired === "string"
            ? j.skillsRequired.split(/,|\n|;|•|-/).map(s => s.trim()).filter(Boolean)
            : [];
        const skillsStr = arr.join(" ");
        const company = j.companyId?.name || "";
        return (
          (j.title || "").toLowerCase().includes(q) ||
          (j.description || "").toLowerCase().includes(q) ||
          skillsStr.toLowerCase().includes(q) ||
          company.toLowerCase().includes(q)
        );
      });
    }

    if (category !== "all") {
      out = out.filter((j) => {
        const c = (j.category || j.industry || "").trim().toLowerCase();
        return c === category.toLowerCase();
      });
    }

    if (skillFilters.length > 0) {
      const sf = new Set(skillFilters.map((s) => s.toLowerCase()));
      out = out.filter((j) => {
        const arr = Array.isArray(j.skillsRequired)
          ? j.skillsRequired
          : typeof j.skillsRequired === "string"
            ? j.skillsRequired.split(/,|\n|;|•|-/).map(s => s.trim()).filter(Boolean)
            : [];
        return arr.some((s) => sf.has(String(s).toLowerCase()));
      });
    }

    if (sort === "az") {
      out = [...out].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      out = [...out].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return out;
  }, [jobs, query, sort, category, skillFilters]);

  async function handleApply(job) {
    if (!user?._id) return alert("Please login again.");
    if (applied.has(job._id)) return;

    try {
      await axios.post(
        "http://localhost:3001/apply",
        { mentorId: user._id, jobId: job._id },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      alert("Application sent ✅");
      setApplied((prev) => new Set(prev).add(job._id));
    } catch (e) {
      const msg = e.response?.data?.message || "Server error";
      alert(msg);
      if (msg.toLowerCase().includes("already applied")) {
        setApplied((prev) => new Set(prev).add(job._id));
      }
    }
  }

  const isActive = (p) => location.pathname === p;

  if (loading) return <p style={{ padding: 16, color: "#111" }}>Loading…</p>;
  if (err) return <p style={{ padding: 16, color: "red" }}>{err}</p>;

  return (
    <div className="feed-wrap">
      <style>{`
        .feed-wrap { background:#f8fafc; min-height:100vh; }
        .feed-layout { display:grid; grid-template-columns:260px 1fr; max-width:1280px; margin:0 auto; min-height:100vh; }

        .feed-side {
          background:#fff; border-right:1px solid #eef2f7; padding:18px 14px;
          display:flex; flex-direction:column; gap:12px;
          height:100vh; position:sticky; top:0;
        }
        .brand { display:flex; align-items:center; gap:12px; font-weight:800; font-size:18px; letter-spacing:.2px; }
        .brand img { width:60px; height:60px; border-radius:12px; }

        .nav { display:flex; flex-direction:column; gap:8px; }
        .navitem {
          display:grid; grid-template-columns:28px 1fr; align-items:center; gap:14px;
          padding:14px 16px; height:64px; border-radius:14px;
          font-weight:700; font-size:20px; text-decoration:none;
          color:#111827 !important; border:1px solid transparent; cursor:pointer;
        }
        .navitem:hover { background:#f5f6ff; }
        .navitem.active { background:#eef2ff; color:#6366f1 !important; border:1px solid #cbd5ff; }
        .navitem .icon { width:28px; height:28px; display:grid; place-items:center; }

        .spacer { flex:1; }
        .logout {
          color:#6366f1 !important; font-weight:700; border:none; background:none; cursor:pointer;
          padding:10px 12px; border-radius:12px; font-size:20px; width:100%;
        }

        .feed-main { padding:20px; }
        .hdr-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .hdr-top .search { flex:1; padding:12px 14px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; }
        .hdr-top .chip { display:flex; align-items:center; gap:10px; background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:8px 12px; }
        .hdr-top .avatar { width:28px; height:28px; border-radius:50%; background:#eef2ff; display:inline-block; }

        .hdr-mid { display:flex; align-items:center; margin-bottom:10px; }
        .hdr-mid .title { font-size:20px; font-weight:800; }

        .hdr-bot {
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; margin-bottom:18px; flex-wrap:wrap;
        }
        .leftFilters { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
        .label { color:#6b7280; font-size:12.5px; }
        .select { padding:10px 12px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; }
        .rightActions { display:flex; gap:12px; }

        .pill {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:16px;
          border:1px solid #e5e7eb; background:#fff;
          font-weight:700; cursor:pointer; color:#6b7280;
        }
        .pill .icon { width:18px; height:18px; }
        .pill:hover { background:#f9fafb; }

        .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:16px; }
        .card { border:1px solid #eee; border-radius:12px; background:#fff; padding:14px; display:flex; flex-direction:column; }
        .company { font-size:12.5px; color:#6b7280 !important; margin-bottom:4px; }
        .title3 { font-size:16px; font-weight:800; margin:0 0 6px; }
        .desc { margin:0 0 8px; font-size:14px; line-height:1.4; color:#374151 !important; }
        .chips { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
        .chip { font-size:12px; background:#f2f4ff; border:1px solid #e5e8ff; padding:4px 8px; border-radius:999px; }
        .cardActions { display:flex; justify-content:space-between; gap:8px; margin-top:auto; }
        .btn { padding:8px 10px; border-radius:10px; border:1px solid #cbd5ff; background:#eef2ff; color:#3f46d8 !important; font-weight:700; cursor:pointer; }
        .btn:disabled { opacity:.6; cursor:not-allowed; }

        /* само за модалот користиме инлајн стилови подолу, не класи */
      `}</style>

      <div className="feed-layout">
        {/* Sidebar */}
        <aside className="feed-side">
          <div className="brand">
            <img src={TokenIcon} alt="token" />
            <span>Mentor Token</span>
          </div>

          <nav className="nav">
            <div className={`navitem ${isActive("/mentor-dashboard") ? "active" : ""}`} onClick={() => navigate("/mentor-dashboard")}>
              <span className="icon"><GridIcon /></span><span>Dashboard</span>
            </div>
            <div className={`navitem ${isActive("/mentorstats") ? "active" : ""}`} onClick={() => navigate("/mentorstats")}>
              <span className="icon"><StatsIcon /></span><span>My Stats</span>
            </div>
            <div className={`navitem ${isActive("/mentor/job-feed") ? "active" : ""}`} onClick={() => navigate("/mentor/job-feed")}>
              <span className="icon"><FeedIcon /></span><span>Job Feed</span>
            </div>
          </nav>

          <div className="spacer" />
          <button className="logout" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </aside>

        {/* Main */}
        <main className="feed-main">
          <div className="hdr-top">
            <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Startup, KPI, Mentor…" />
            <div className="chip"><span className="avatar" />{user?.name || user?.email || "Mentor"}</div>
          </div>

          <div className="hdr-mid"><div className="title">All startup Jobs</div></div>

          <div className="hdr-bot">
            <div className="leftFilters">
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span className="label">Sort by:</span>
                <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Popular / Newest</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span className="label">Category:</span>
                <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (<option key={c} value={c}>{c === "all" ? "All Category" : c}</option>))}
                </select>
              </div>
            </div>

            <div className="rightActions">
              <button className="pill" onClick={() => setShowFilters(true)}>
                <span className="icon"><FilterIcon /></span><span>Filters</span>
              </button>
              <button className="pill" title="View" onClick={() => setView((v) => (v === "grid" ? "grid" : "grid"))}>
                <span className="icon"><FourSquaresIcon /></span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid" data-view={view}>
            {filtered.map((job) => (
              <div key={job._id} className="card">
                <div className="company">{job.companyId?.name || "Startup"}</div>
                <h3 className="title3">{job.title}</h3>
                <p className="desc">
                  {(job.description || "").slice(0, 140)}
                  {(job.description || "").length > 140 ? "…" : ""}
                </p>

                {(() => {
                  const arr = Array.isArray(job.skillsRequired)
                    ? job.skillsRequired
                    : typeof job.skillsRequired === "string"
                      ? job.skillsRequired.split(/,|\n|;|•|-/).map(s => s.trim()).filter(Boolean)
                      : [];
                  return arr.length ? (
                    <div className="chips">
                      {arr.slice(0, 5).map((s, i) => (<span key={i} className="chip">{s}</span>))}
                    </div>
                  ) : null;
                })()}

                <div className="cardActions">
                  <button className="btn" onClick={() => setOpenJob(job)}>View More</button>
                  <button className="btn" disabled={applied.has(job._id)} onClick={() => handleApply(job)}>
                    {applied.has(job._id) ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View More modal */}
          {openJob && (
            <Modal onClose={() => setOpenJob(null)}>
              <JobDetails job={openJob} onApply={() => handleApply(openJob)} applied={applied.has(openJob._id)} />
            </Modal>
          )}

          {/* Filters modal */}
          {showFilters && (
            <Modal onClose={() => setShowFilters(false)}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Filters</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Skills</div>
              <div style={{ maxHeight: 340, overflow: "auto", paddingRight: 6 }}>
                {allSkills.length === 0 && (<div style={{ color: "#6b7280" }}>No skills found on jobs.</div>)}
                {allSkills.map((s) => {
                  const checked = skillFilters.includes(s);
                  return (
                    <label key={s} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) setSkillFilters((prev) => [...prev, s]);
                          else setSkillFilters((prev) => prev.filter((x) => x !== s));
                        }}
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:10 }}>
                <button className="btn" onClick={() => setSkillFilters([])}>Clear</button>
                <button className="btn" onClick={() => setShowFilters(false)}>Apply</button>
              </div>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
}

/* ------- Job Details ------- */
function JobDetails({ job, onApply, applied }) {
  const company = job?.companyId?.name || "Startup";
  const category = (job?.category || job?.industry || "").trim();
  const location = job?.location || job?.city || job?.country || "";
  const employment = job?.type || job?.employmentType || job?.contractType || "";
  const created = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : null;

  const toArray = (val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string") return val.split(/,|\n|;|•|-/).map(s => s.trim()).filter(Boolean);
    return [];
  };
  const skills = toArray(job?.skillsRequired);
  const responsibilities = toArray(job?.responsibilities || job?.responsibility);
  const requirements = toArray(job?.requirements || job?.requirement);

  const salaryMin = job?.salaryMin ?? job?.compensation?.min ?? null;
  const salaryMax = job?.salaryMax ?? job?.compensation?.max ?? null;
  const salaryCurr = job?.salaryCurrency ?? job?.compensation?.currency ?? "";
  const salary = (salaryMin != null || salaryMax != null)
    ? `${salaryMin ?? "?"}–${salaryMax ?? "?"} ${salaryCurr}`.trim()
    : null;

  return (
    <div style={{ position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"#eef2ff", border:"1px solid #e5e7eb" }} />
        <div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:2 }}>{company}</div>
          <h3 style={{ margin:0, fontSize:20, fontWeight:800 }}>{job?.title || "Untitled role"}</h3>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"10px 0 14px" }}>
        {category && <span style={tagStyle}>Category: {category}</span>}
        {location && <span style={tagStyle}>Location: {location}</span>}
        {employment && <span style={tagStyle}>Type: {employment}</span>}
        {created && <span style={tagStyle}>Posted: {created}</span>}
        {salary && <span style={tagStyle}>Salary: {salary}</span>}
      </div>

      {job?.description && (
        <>
          <div style={sectionTitle}>Description</div>
          <div style={sectionText}>{job.description}</div>
        </>
      )}

      {skills.length > 0 && (
        <>
          <div style={sectionTitle}>Required skills</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {skills.map((s, i) => (<span key={i} style={chipStyle}>{s}</span>))}
          </div>
        </>
      )}

      {responsibilities.length > 0 && (
        <>
          <div style={sectionTitle}>Responsibilities</div>
          <ul style={{ ...sectionText, paddingLeft:18, margin:0 }}>
            {responsibilities.map((r, i) => (<li key={i}>{r}</li>))}
          </ul>
        </>
      )}

      {requirements.length > 0 && (
        <>
          <div style={sectionTitle}>Requirements</div>
          <ul style={{ ...sectionText, paddingLeft:18, margin:0 }}>
            {requirements.map((r, i) => (<li key={i}>{r}</li>))}
          </ul>
        </>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
        <button className="btn" disabled={applied} onClick={onApply}>
          {applied ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}

const tagStyle = {
  fontSize:12, padding:"6px 10px", borderRadius:999,
  background:"#f9fafb", border:"1px solid #e5e7eb", color:"#374151"
};
const sectionTitle = { fontWeight:700, margin:"14px 0 8px" };
const sectionText  = { lineHeight:1.6, color:"#374151" };
const chipStyle    = { fontSize:12, background:"#f2f4ff", border:"1px solid #e5e8ff", padding:"4px 8px", borderRadius:999, display:"inline-block" };

/* ------- Modal: close on outside click (backdrop) + Esc, portal ------- */
function Modal({ children, onClose }) {
  // close on Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    // close only if clicked the backdrop itself (outside the card)
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      onMouseDown={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
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
        onMouseDown={(e) => e.stopPropagation()} // clicks inside shouldn't close
        style={{
          position: "relative",
          width: "min(92vw, 640px)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 16,
          padding: 22,
          border: "1px solid #eef2f7",
          boxShadow: "0 20px 50px rgba(0,0,0,.18)",
          pointerEvents: "auto",
          marginLeft: window.innerWidth > 980 ? 0 : 0, // keeps centered; sidebar offset handled via layout
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            border: "none",
            background: "transparent",
            fontSize: 22,
            lineHeight: 1,
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

/* ------- Icons ------- */
function GridIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="#4f46e5" strokeWidth="1.6" />
    </svg>
  );
}
function StatsIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function FeedIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#4f46e5" strokeWidth="1.6" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="16" x2="12" y2="16" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function FilterIcon({ width = 18, height = 18 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function FourSquaresIcon({ width = 18, height = 18 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="5" width="6" height="6" rx="2" />
      <rect x="13" y="5" width="6" height="6" rx="2" />
      <rect x="5" y="13" width="6" height="6" rx="2" />
      <rect x="13" y="13" width="6" height="6" rx="2" />
    </svg>
  );
}
