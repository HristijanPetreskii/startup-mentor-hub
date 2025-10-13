// src/Pages/mentorStats.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import TokenIcon from "../assets/ic_outline-token.png"; // 60x60

export default function MentorStats() {
  const { user, token, logout } = useContext(AuthContext);
  const mentorId = user?._id || user?.id;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [apps, setApps] = useState([]);
  const [offers, setOffers] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        if (!mentorId) throw new Error("Please login as mentor.");
        setErr(""); setLoading(true);

        const a = axios.get(`/applications/${mentorId}`);
        const o = axios.get(`/offers/mentor/${mentorId}`).catch(() => ({ data: { offers: [] } }));
        const j = axios.get(`/jobs`).catch(() => ({ data: { jobs: [] } }));

        const [aRes, oRes, jRes] = await Promise.all([a, o, j]);
        if (cancel) return;

        setApps(Array.isArray(aRes.data) ? aRes.data : []);
        setOffers(Array.isArray(oRes.data?.offers) ? oRes.data.offers : []);
        setJobs(Array.isArray(jRes.data?.jobs) ? jRes.data.jobs : []);
      } catch (e) {
        if (!cancel) setErr(e.response?.data?.message || e.message || "Failed to load");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, [mentorId]);

  const assignedFromOffers = useMemo(
    () => (offers || []).filter(o => (o.status || "").toLowerCase() === "inprogress"),
    [offers]
  );

  const totalJobs = jobs.length;
  const totalAssigned = (apps || []).filter(Boolean).length + assignedFromOffers.length;
  const appliedCount = (apps || []).length;
  const finishedCount =
    (apps || []).filter(a => (a.status || "").toLowerCase().includes("done")).length;

  const perfSeries = useMemo(() => {
    const now = new Date(); const buckets = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ y: d.getFullYear(), m: d.getMonth(), v: 0 });
    }
    function bump(dateStr) {
      if (!dateStr) return;
      const d = new Date(dateStr);
      const b = buckets.find(b => b.y === d.getFullYear() && b.m === d.getMonth());
      if (b) b.v += 1;
    }
    (apps || []).forEach(a => bump(a.createdAt));
    assignedFromOffers.forEach(o => bump(o.createdAt));
    return buckets.map(b => b.v);
  }, [apps, assignedFromOffers]);

  const monthLabels = useMemo(() => {
    const now = new Date(); const arr = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(d.toLocaleString(undefined, { month: "short" }));
    }
    return arr;
  }, []);

  if (loading) return <div style={{ padding: 16, color: "#111" }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  const isActive = (p) => location.pathname === p;

  return (
    <div className="ms-wrap">
      <style>{`
        .ms-wrap { --accent:#6366f1; --ink:#111; --muted:#6b7280; background:#f8fafc; min-height:100vh; }
        .ms-wrap, .ms-wrap * { color: var(--ink) !important; box-sizing:border-box; }

        /* Layout исто како на Dashboard */
        .ms-layout { display:grid; grid-template-columns: 260px 1fr; max-width:1280px; margin:0 auto; }

        /* ===== Sidebar (flex) ===== */
        .ms-side {
          background:#fff; border-right:1px solid #eef2f7; padding:18px 14px;
          display:flex; flex-direction:column; gap:12px;
        }
        .brand { display:flex; align-items:center; gap:12px; font-weight:800; font-size:18px; letter-spacing:.2px; }
        .brand img { width:60px; height:60px; border-radius:12px; }

        /* NAV — вертикално, тесно до врвот */
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

        .spacer { flex:1; }     /* турка Logout долу */
        .logout {
          color:#6366f1 !important; font-weight:700; border:none; background:none; cursor:pointer;
          padding:10px 12px; border-radius:12px; font-size:20px; width:100%;
        }

        /* ===== Main / Topbar ===== */
        .ms-main { padding: 20px; }
        .topbar { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; margin-bottom:16px; }
        .searchWrap { display:flex; justify-content:center; }
        .search { width:100%; max-width:420px; padding:10px 14px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; }

        .chip { display:flex; align-items:center; gap:10px; background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:6px 10px; }
        .avatar { width:28px; height:28px; border-radius:50%; background:#eef2ff; display:inline-block; }

        .panel { border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding:16px; }

        .profileCard { display:flex; gap:14px; align-items:center; }
        .profilePic { width:68px; height:68px; border-radius:50%; background:#eef2ff; overflow:hidden; flex:0 0 auto; display:grid; place-items:center; font-weight:800; color:#3f46d8 !important; }

        .kv { font-size:13px; color:var(--muted) !important; }
        .value { font-weight:700; }

        .quickGrid { display:grid; gap:10px; }
        .statTile { border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; background:#fff; }
        .statLabel { font-size:13px; color:var(--muted) !important; margin-bottom:6px; }
        .statValue { font-size:18px; font-weight:800; }

        .chartCard { border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding:12px; }
        .chartTitle { font-weight:800; margin-bottom:8px; }

        @media (max-width: 980px) {
          .ms-layout { grid-template-columns: 1fr; }
          .ms-side { display:none; }
        }
      `}</style>

      <div className="ms-layout">
        {/* ===== LEFT: Sidebar ===== */}
        <aside className="ms-side">
          <div className="brand">
            <img src={TokenIcon} alt="token" />
            <span>Mentor Token</span>
          </div>

          <nav className="nav">
            <div
              className={`navitem ${isActive("/mentor-dashboard") ? "active" : ""}`}
              onClick={() => navigate("/mentor-dashboard")}
            >
              <span className="icon"><GridIcon width={22} height={22} /></span>
              <span>Dashboard</span>
            </div>

            <div
              className={`navitem ${isActive("/mentorstats") ? "active" : ""}`}
              onClick={() => navigate("/mentorstats")}
            >
              <span className="icon"><StatsIcon width={22} height={22} /></span>
              <span>My Stats</span>
            </div>

            <div
              className={`navitem ${isActive("/mentor/job-feed") ? "active" : ""}`}
              onClick={() => navigate("/mentor/job-feed")}
            >
              <span className="icon"><FeedIcon width={22} height={22} /></span>
              <span>Job Feed</span>
            </div>
          </nav>

          <div className="spacer" />
          <button className="logout" onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
        </aside>

        {/* ===== RIGHT: Main ===== */}
        <main className="ms-main">
          <div className="topbar">
            <h4 style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>My Stats</h4>
            <div className="searchWrap"><input className="search" placeholder="Search" /></div>
            <div className="chip"><span className="avatar" />{user?.name || user?.email || "Mentor"}</div>
          </div>

          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, marginBottom: 16 }}>
            <section className="panel">
              <div className="profileCard">
                <div className="profilePic">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (user?.name || user?.email || "M").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="value" style={{ fontSize: 18 }}>{user?.name || "Mentor"}</div>
                  <div className="kv">{user?.title || "Sales Representative"}</div>
                  <div className="kv" style={{ marginTop: 8 }}>
                    <div style={{ marginBottom: 2 }}>{user?.email}</div>
                    <div>{user?.phone || "+389 7x xxx xxx"}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>About</div>
              <div className="kv" style={{ marginBottom: 6 }}>
                <span className="value">Skills: </span>Sales | Management | Problem-solving
              </div>
              <p style={{ lineHeight: 1.5, margin: 0 }}>
                {user?.about ||
                  "Lorem ipsum dolor sit amet consectetur. Suspendisse quis varius felis augue adipiscing. " +
                  "Sapien volutpat ac velit facilisis fermentum diam blandit nunc. Suspendisse vitae varius felis augue adipiscing."}
              </p>
            </section>
          </div>

          {/* Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
            <section className="chartCard">
              <div className="chartTitle">Performance Over Time</div>
              <TinyLineChart data={perfSeries} labels={monthLabels} />
            </section>

            <section className="panel">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Quick Overview</div>
              <div className="quickGrid">
                <div className="statTile"><div className="statLabel">Total Jobs</div><div className="statValue">{totalJobs}</div></div>
                <div className="statTile"><div className="statLabel">Total Assigned Jobs</div><div className="statValue">{totalAssigned}</div></div>
                <div className="statTile"><div className="statLabel">Jobs That You Have Applied</div><div className="statValue">{appliedCount}</div></div>
                <div className="statTile" style={{ background:"#f3f0ff" }}>
                  <div className="statLabel">Finished Jobs</div><div className="statValue">{finishedCount}</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===== Tiny SVG Line Chart ===== */
function TinyLineChart({ data = [], labels = [] }) {
  const width = 620, height = 220, pad = 28;
  const max = Math.max(1, ...data);
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1);
  const scaleY = (height - pad * 2) / max;
  const points = data.map((v, i) => `${pad + i * stepX},${height - pad - v * scaleY}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e5e7eb" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#e5e7eb" />
      <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" />
      {data.map((v, i) => {
        const x = pad + i * stepX; const y = height - pad - v * scaleY;
        return <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" />;
      })}
      {labels.map((m, i) => {
        const x = pad + i * stepX;
        return (
          <text key={i} x={x} y={height - pad + 18} textAnchor="middle" fontSize="10" fill="#6b7280">{m}</text>
        );
      })}
    </svg>
  );
}

/* ===== Tiny icon components (22px) ===== */
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
function StatsIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function FeedIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#4f46e5" strokeWidth="1.6"/>
      <line x1="7" y1="8" x2="17" y2="8" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="7" y1="16" x2="12" y2="16" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
