// src/Pages/Startup.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import tokenIcon from "../assets/ic_outline-token.png";

export default function Startup() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);

        const jRes = await axios.get("http://localhost:3001/my-jobs", { headers });
        const myJobs = jRes.data?.jobs ?? jRes.data ?? [];
        if (!cancelled) setJobs(myJobs);

        const perfRes = await axios.get("http://localhost:3001/top-mentors");
        const performances = perfRes.data ?? [];

        const mRes = await axios.get("http://localhost:3001/mentors");
        const mentors = mRes.data ?? [];

        const joined = performances
          .map((p) => ({
            ...p,
            mentor: mentors.find((m) => m._id === (p.mentorId?._id || p.mentorId)),
          }))
          .filter((x) => x.mentor)
          .slice(0, 3);

        if (!cancelled) setTopMentors(joined);
      } catch (e) {
        if (!cancelled)
          setErr(e.response?.data?.message || "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const [tab, setTab] = useState("All");
  const filteredJobs = useMemo(() => {
    if (tab === "All") return jobs;
    const wanted =
      tab === "Done"
        ? "done"
        : tab === "Rejected"
        ? "rejected"
        : tab === "In Progress"
        ? "inprogress"
        : "open";
    return jobs.filter((j) => (j.status || "").toLowerCase() === wanted);
  }, [jobs, tab]);

  const visibleMentors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topMentors;
    return topMentors.filter(
      (x) =>
        (x.mentor.name || "").toLowerCase().includes(q) ||
        (x.mentor.email || "").toLowerCase().includes(q)
    );
  }, [topMentors, query]);

  const { months, createdCounts, doneCounts, maxY } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const created = Array(12).fill(0);
    const done = Array(12).fill(0);

    for (const j of jobs) {
      const dt = new Date(j.createdAt || j.updatedAt || Date.now());
      if (dt.getFullYear() !== year) continue;
      const m = dt.getMonth();
      created[m] += 1;
      if ((j.status || "").toLowerCase() === "done") done[m] += 1;
    }
    const maxY = Math.max(1, ...created, ...done);
    return { months, createdCounts: created, doneCounts: done, maxY };
  }, [jobs]);

  const isActive = (p) => location.pathname === p;

  if (loading) return <div style={{ padding: 16, color: "#111" }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  const chipName = user?.companyName || user?.name || user?.email || "Startup";
  const chipInitial = chipName.charAt(0).toUpperCase();

  return (
    <div className="su-wrap">
      <style>{`
        .su-wrap{--accent:#6366f1;--ink:#111;--muted:#6b7280;background:#f8fafc;min-height:100vh}
        .su-wrap,.su-wrap *{color:var(--ink)!important;box-sizing:border-box}

        .su-layout{display:grid;grid-template-columns:260px 1fr;max-width:1280px;margin:0 auto}

        /* ===== Sidebar (ист стил како MentorStats) ===== */
        .su-side{
          background:#fff;border-right:1px solid #eef2f7;padding:18px 14px;
          display:flex;flex-direction:column;gap:12px
        }
        .brand{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:.2px;font-size:18px;padding:4px 6px}
        .brand img{width:60px;height:60px;border-radius:12px}

        .nav{display:flex;flex-direction:column;gap:8px;margin-top:6px;padding-right:6px}
        .navitem{
          position:relative;display:grid;grid-template-columns:28px 1fr;align-items:center;gap:10px;
          font-size:17px;font-weight:700;padding:12px 14px;border-radius:12px;
          color:#374151!important;cursor:pointer;border:1px solid transparent;text-decoration:none
        }
        .navitem:hover{background:#f3f4ff}
        .navitem.active{background:#ecebff;color:#3f46d8!important;border:1px solid #cbd5ff}
        .navitem.active::after{content:"";position:absolute;right:-8px;top:6px;bottom:6px;width:3px;background:var(--accent);border-radius:4px}
        .navitem .icon{width:22px;height:22px;display:inline-grid;place-items:center}

        .logout{color:#3b82f6!important;font-weight:700;border:none;background:none;cursor:pointer;padding:10px 12px;border-radius:10px;margin-top:auto}

        /* Main */
        .su-main{padding:20px}
        .topbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .search{width:360px;max-width:100%;padding:10px 12px;border-radius:12px;border:1px solid #e5e7eb}
        .chip{margin-left:auto;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:6px 10px}
        .chip .av{width:28px;height:28px;border-radius:50%;background:#eef2ff;display:grid;place-items:center;font-weight:800;color:#3f46d8!important}

        .grid2{display:grid;grid-template-columns:1.05fr 1fr;gap:20px}
        .card{border:1px solid #eee;border-radius:14px;padding:16px;background:#fff}
        .tabs{display:flex;gap:10px;margin-bottom:12px}
        .pill{border:1px solid;border-radius:999px;padding:6px 12px;cursor:pointer}
        .row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid #f0f0f0;border-radius:10px}
        .status{border:1px solid;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:700}
        .mentorRow{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #f0f0f0;border-radius:10px}
        .legend{display:inline-flex;align-items:center;gap:6px}
        .legend span{width:12px;height:12px;border-radius:3px}
        
        @media (max-width: 980px){
          .su-layout{grid-template-columns:1fr}
          .su-side{display:none}
          .grid2{grid-template-columns:1fr}
        }
      `}</style>

      <div className="su-layout">
        {/* ========== LEFT: Sidebar ========== */}
        <aside className="su-side">
          <div className="brand">
            <img src={tokenIcon} alt="token" />
            <span>Mentor Token</span>
          </div>

          <nav className="nav">
            <Link
              to="/startup-dashboard"
              className={`navitem ${isActive("/startup-dashboard") ? "active" : ""}`}
            >
              <span className="icon"><GridIcon /></span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/startup-mentors"
              className={`navitem ${isActive("/startup-mentors") ? "active" : ""}`}
            >
              <span className="icon"><UsersIcon /></span>
              <span>Mentors</span>
            </Link>

            <Link
              to="/startup/jobs"
              className={`navitem ${isActive("/startup/jobs") ? "active" : ""}`}
            >
              <span className="icon"><BriefcaseIcon /></span>
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

        {/* ========== RIGHT: Main (не менуван) ========== */}
        <main className="su-main">
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

          <div className="grid2">
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Assigned Jobs</h3>

              <div className="tabs">
                {["All", "Done", "Rejected", "In Progress"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="pill"
                    style={{
                      background: tab === t ? "#eef2ff" : "#f7f7f8",
                      borderColor: tab === t ? "#6366f1" : "#e5e7eb",
                      color: tab === t ? "#3730a3" : "#555",
                      fontWeight: 700,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <Empty text="No jobs for this filter. Create one to get started." />
              )}

              <div style={{ display: "grid", gap: 8 }}>
                {filteredJobs.map((j) => (
                  <div key={j._id} className="row">
                    <div>
                      <div style={{ fontWeight: 600 }}>{j.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>
                        {(j.description || "").slice(0, 120)}
                      </div>
                    </div>
                    <span className="status" style={statusColors(j.status)}>
                      {labelizeStatus(j.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h3 style={{ marginTop: 0 }}>Best Performing Mentors</h3>

              {visibleMentors.length === 0 && <Empty text="No mentors match your search." />}

              <div style={{ display: "grid", gap: 10 }}>
                {visibleMentors.map((x) => (
                  <div key={x._id || x.mentorId} className="mentorRow">
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {x.mentor.name || "Unnamed mentor"}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>{x.mentor.email}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {x.completedJobs ?? x.total ?? 0}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Achieved Jobs</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Overall Statistic</h3>

            <MiniChart
              labels={months}
              series={[
                { name: "Created", data: createdCounts, stroke: "#6366f1" },
                { name: "Done", data: doneCounts, stroke: "#10b981" },
              ]}
              maxY={maxY}
            />

            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13 }}>
              <span className="legend">
                <span style={{ background: "#6366f1" }} />
                Created
              </span>
              <span className="legend">
                <span style={{ background: "#10b981" }} />
                Done
              </span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ===== MiniChart (SVG) ===== */
function MiniChart({ labels, series, maxY }) {
  const W = 820;
  const H = 220;
  const PAD = 28;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const N = labels.length || 1;
  const stepX = innerW / Math.max(1, N - 1);
  const scaleY = (v) => innerH * (v / Math.max(1, maxY));

  const buildPath = (arr) => {
    if (!arr || !arr.length) return "";
    let d = "";
    arr.forEach((v, i) => {
      const x = PAD + i * stepX;
      const y = PAD + (innerH - scaleY(v));
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
        const y = PAD + innerH * p;
        return <line key={idx} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#eef2f7" strokeWidth="1" />;
      })}

      {labels.map((lab, i) => {
        const x = PAD + i * stepX;
        return (
          <text key={lab + i} x={x} y={H - 6} textAnchor="middle" fontSize="11" fill="#6b7280">
            {lab}
          </text>
        );
      })}

      {series.map((s) => (
        <g key={s.name}>
          <path d={buildPath(s.data)} fill="none" stroke={s.stroke} strokeWidth="2.5" />
          {s.data.map((v, i) => {
            const x = PAD + i * stepX;
            const y = PAD + (innerH - scaleY(v));
            return <circle key={i} cx={x} cy={y} r="3" fill={s.stroke} />;
          })}
        </g>
      ))}
    </svg>
  );
}

/* ===== helpers & small components ===== */
function labelizeStatus(s = "") {
  const v = s.toLowerCase();
  if (v === "inprogress") return "IN PROGRESS";
  return v.toUpperCase();
}
function statusColors(s = "") {
  const v = s.toLowerCase();
  if (v === "done") return { background: "#e8faf0", color: "#0f766e", borderColor: "#99f6e4" };
  if (v === "rejected") return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (v === "inprogress") return { background: "#eef2ff", color: "#3730a3", borderColor: "#c7d2fe" };
  return { background: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" };
}
function Empty({ text }) {
  return (
    <div style={{ padding: 16, border: "1px dashed #e5e7eb", borderRadius: 10, color: "#6b7280" }}>
      {text}
    </div>
  );
}

/* ====== Tiny sidebar icons (исти тонови како MentorStats) ====== */
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
