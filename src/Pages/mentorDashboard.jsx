// src/Pages/MentorDashboard.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import TokenIcon from "../assets/ic_outline-token.png"; // 60x60

export default function MentorDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const mentorId = user?._id || user?.id;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [apps, setApps] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tab, setTab] = useState("all"); // all | done | rejected | inprogress

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setErr("");
        if (!mentorId) throw new Error("Please login as mentor.");
        setLoading(true);

        const a = axios.get(`/applications/${mentorId}`);
        const o = axios
          .get(`/offers/mentor/${mentorId}`)
          .catch(() => ({ data: { offers: [] } }));

        const [aRes, oRes] = await Promise.all([a, o]);
        if (cancel) return;

        setApps(Array.isArray(aRes.data) ? aRes.data : []);
        setOffers(Array.isArray(oRes.data?.offers) ? oRes.data.offers : []);
      } catch (e) {
        if (!cancel) setErr(e.response?.data?.message || e.message || "Failed to load");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [mentorId]);

  // Assigned = applications + accepted offers (in progress)
  const assignedItems = useMemo(() => {
    const fromApps = (apps || []).map((a) => ({
      id: a._id,
      title: a.jobTitle || "Job",
      status: a.status || "Pending",
      source: "application",
    }));

    const fromOffersInProgress = (offers || [])
      .filter((o) => (o.status || "").toLowerCase() === "inprogress")
      .map((o) => ({
        id: o._id,
        title: o.jobId?.title || "Job",
        status: "In Progress",
        source: "offer",
      }));

    return [...fromApps, ...fromOffersInProgress];
  }, [apps, offers]);

  const assignedFiltered = useMemo(() => {
    if (tab === "all") return assignedItems;
    const map = { done: "Done", rejected: "Rejected", inprogress: "In Progress" };
    return assignedItems.filter((i) => i.status === map[tab]);
  }, [assignedItems, tab]);

  const pendingOffers = useMemo(
    () => (offers || []).filter((o) => (o.status || "").toLowerCase() === "pending"),
    [offers]
  );

  async function respondOffer(offerId, response) {
    try {
      await axios.post(
        "/respond-job-offer",
        { offerId, response }, // 'inprogress' | 'rejected'
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setOffers((prev) => prev.map((o) => (o._id === offerId ? { ...o, status: response } : o)));
    } catch (e) {
      alert(e.response?.data?.message || "Server error");
    }
  }

  const isActive = (p) => location.pathname === p;

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  return (
    <div className="md-wrap">
      <style>{`
        .md-wrap { background:#f8fafc; } /* без мин. висина овде */

        /* центрирана ширина + висина: цел екран */
        .md-layout {
          display:grid;
          grid-template-columns:260px 1fr;
          max-width:1280px;
          margin:0 auto;
          min-height:100vh;           /* ја држи висината на екранот */
        }

        /* Sidebar: sticky, цела висина */
        .md-side {
          background:#fff;
          border-right:1px solid #eef2f7;
          padding:18px 14px;
          display:flex; flex-direction:column; gap:12px;
          height:100vh;
          position:sticky; top:0;
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

        /* Main */
        .md-main { padding:20px; }
        .topbar { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; margin-bottom:16px; }
        .searchWrap { display:flex; justify-content:center; }
        .search { width:100%; max-width:420px; padding:10px 14px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; }

        .chip { display:flex; align-items:center; gap:10px; background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:6px 10px; }
        .avatar { width:28px; height:28px; border-radius:50%; background:#eef2ff; display:inline-block; }

        .panel { border:1px solid #eee; border-radius:12px; padding:16px; background:#fff; }

        .tabsRow { display:flex; gap:18px; flex-wrap:wrap; }
        .tabBtn { padding:8px 0; background:transparent; border:none; font-size:14px; font-weight:700; color:#111827; cursor:pointer; }
        .tabBtn.active { box-shadow:inset 0 -3px 0 0 #6366f1; border-radius:0; }

        .rowCard { border:1px solid #eee; border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; }

        @media (max-width:980px) {
          .md-layout { grid-template-columns:1fr; }
          .md-side { display:none; height:auto; position:static; }
        }
      `}</style>

      <div className="md-layout">
        {/* ===== Sidebar ===== */}
        <aside className="md-side">
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
          <button className="logout" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </aside>

        {/* ===== Main ===== */}
        <main className="md-main">
          <div className="topbar">
            <h4 style={{ margin:0, fontWeight:700, color:"#0f172a" }}>Dashboard</h4>
            <div className="searchWrap"><input className="search" placeholder="Search" /></div>
            <div className="chip"><span className="avatar" />{user?.name || user?.email || "Mentor"}</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* Left: Assigned Jobs */}
            <section className="panel">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <h3 style={{ margin:0 }}>Assigned Jobs</h3>
                <div className="tabsRow">
                  {[
                    { key:"all", label:"All" },
                    { key:"done", label:"Done" },
                    { key:"rejected", label:"Rejected" },
                    { key:"inprogress", label:"In Progress" },
                  ].map(t => (
                    <button
                      key={t.key}
                      className={`tabBtn ${tab === t.key ? "active" : ""}`}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"grid", gap:8 }}>
                {assignedFiltered.map(item => (
                  <div key={`${item.source}-${item.id}`} className="rowCard">
                    <div style={{ fontWeight:600 }}>{item.title}</div>
                    <StatusPill status={item.status} />
                  </div>
                ))}
                {assignedFiltered.length === 0 && (
                  <div style={{ fontSize:13, opacity:.7 }}>No items for this filter.</div>
                )}
              </div>
            </section>

            {/* Right: Pending + Applications */}
            <div style={{ display:"grid", gap:20 }}>
              <section className="panel">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <h3 style={{ margin:0 }}>Pending Jobs</h3>
                </div>
                <div style={{ display:"grid", gap:8 }}>
                  {pendingOffers.map(o => (
                    <div key={o._id} className="rowCard">
                      <div style={{ fontWeight:600 }}>{o.jobId?.title || "Job Offer"}</div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => respondOffer(o._id, "inprogress")} style={acceptBtn}>Accept</button>
                        <button onClick={() => respondOffer(o._id, "rejected")} style={rejectBtn}>Reject</button>
                      </div>
                    </div>
                  ))}
                  {pendingOffers.length === 0 && <div style={{ fontSize:13, opacity:.7 }}>No pending offers.</div>}
                </div>
              </section>

              <section className="panel">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <h3 style={{ margin:0 }}>Applications sent</h3>
                </div>
                <div style={{ display:"grid", gap:8 }}>
                  {(apps || []).map(a => (
                    <div key={a._id} className="rowCard">
                      <div style={{ fontWeight:600 }}>{a.jobTitle}</div>
                      <StatusPill status={a.status} />
                    </div>
                  ))}
                  {(apps || []).length === 0 && <div style={{ fontSize:13, opacity:.7 }}>No applications yet.</div>}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */
function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const style = {
    fontSize:12,
    padding:"4px 10px",
    borderRadius:999,
    display:"inline-block",
    background:
      s.includes("done") ? "#e8fff3" :
      s.includes("progress") ? "#eef2ff" :
      s.includes("reject") ? "#ffecec" : "#f3f4f6",
    border:
      s.includes("done") ? "1px solid #b7f0cf" :
      s.includes("progress") ? "1px solid #dfe3ff" :
      s.includes("reject") ? "1px solid #ffd0d0" : "1px solid #e5e7eb",
    color:
      s.includes("done") ? "#0a7f49" :
      s.includes("progress") ? "#3f46d8" :
      s.includes("reject") ? "#b42318" : "#374151",
  };
  return <span style={style}>{status}</span>;
}

const acceptBtn = {
  fontSize:12, borderRadius:999, border:"1px solid #cbd5ff", background:"#eef2ff", padding:"4px 10px", cursor:"pointer",
};
const rejectBtn = {
  fontSize:12, borderRadius:999, border:"1px solid #ffd0d0", background:"#ffecec", padding:"4px 10px", cursor:"pointer",
};

/* Sidebar icons (22px) – исти како на Stats */
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
