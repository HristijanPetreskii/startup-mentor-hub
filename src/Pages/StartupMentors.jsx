// src/Pages/StartupMentors.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import tokenIcon from "../assets/ic_outline-token.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PAGE_SIZE = 3;

export default function StartupMentors() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mentors, setMentors] = useState([]);
  const [query, setQuery] = useState("");
  const [overview, setOverview] = useState({ totalMentors: 0, assigned: 0, finished: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const authH = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setErr("");

        const mRes = await axios.get(`${API}/mentors`);
        const allMentors = mRes.data || [];
        if (!cancelled) setMentors(allMentors);

        const jRes = await axios.get(`${API}/my-jobs`, { headers: authH });
        const jobs = jRes.data?.jobs || [];
        const finished = jobs.filter((j) => String(j.status).toLowerCase() === "done").length;

        const oRes = await axios.get(`${API}/my-offers`, { headers: authH });
        const offers = oRes.data?.offers || [];
        const inprogress = offers.filter((o) => String(o.status).toLowerCase() === "inprogress").length;

        if (!cancelled) {
          setOverview({
            totalMentors: allMentors.length,
            assigned: inprogress,
            finished,
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [authH]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const skills = Array.isArray(m.skills) ? m.skills.join(" ").toLowerCase() : "";
      return name.includes(q) || email.includes(q) || skills.includes(q);
    });
  }, [mentors, query]);

  // pager (3 по страна)
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const end = Math.min(filtered.length, start + PAGE_SIZE);
  const pageItems = filtered.slice(start, end);
  useEffect(() => { setPage(0); }, [filtered.length]);

  const isActive = (p) => location.pathname === p;
  const chipName = user?.companyName || user?.name || user?.email || "Startup";
  const chipInitial = chipName?.charAt(0)?.toUpperCase() || "S";

  if (loading) return <div style={{ padding: 16, color: "#111" }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  return (
    <div className="su-wrap">
      <style>{`
        .su-wrap{--accent:#6366f1;--ink:#111;--muted:#6b7280;background:#f8fafc;min-height:100vh}
        .su-wrap,.su-wrap *{color:var(--ink)!important;box-sizing:border-box}

        /* ▶︎ Исто нав мени како во Startup.jsx (компактно) */
        .su-layout{display:grid;grid-template-columns:240px 1fr;max-width:1280px;margin:0 auto}

        .su-side{
          background:#fff;border-right:1px solid #eef2f7;padding:14px 12px;
          display:flex;flex-direction:column;gap:12px
        }
        .brand{display:flex;align-items:center;gap:8px;font-weight:800;letter-spacing:.2px;font-size:16px;padding:4px 6px}
        .brand img{width:20px;height:20px}

        .nav{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-right:4px}
        .navitem{
          position:relative;display:grid;grid-template-columns:24px 1fr;align-items:center;gap:8px;
          font-size:15px;font-weight:700;padding:8px 10px;border-radius:10px;
          color:#374151!important;cursor:pointer;border:1px solid transparent;text-decoration:none
        }
        .navitem:hover{background:#f3f4ff}
        .navitem.active{background:#ecebff;color:#3f46d8!important;border:1px solid #cbd5ff}
        .navitem.active::after{content:"";position:absolute;right:-6px;top:6px;bottom:6px;width:3px;background:var(--accent);border-radius:4px}
        .navitem .icon{width:22px;height:22px;display:inline-grid;place-items:center}

        .logout{color:#3b82f6!important;font-weight:700;border:none;background:none;cursor:pointer;padding:8px 10px;border-radius:10px;margin-top:auto;font-size:14px}

        /* Main */
        .su-main{padding:20px}
        .topbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .search{width:360px;max-width:100%;padding:10px 12px;border-radius:12px;border:1px solid #e5e7eb;background:#fff}
        .chip{margin-left:auto;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:6px 10px}
        .chip .av{width:28px;height:28px;border-radius:50%;background:#eef2ff;display:grid;place-items:center;font-weight:800;color:#3f46d8!important}

        /* Content: листа (лево) + overview (десно) */
        .content{display:grid;grid-template-columns:1fr 320px;gap:16px}
        .panel{border:1px solid #eee;border-radius:12px;background:#fff;padding:14px}

        /* Mentor cards */
        .cards{display:grid;gap:12px}
        .card{border:1px solid #eee;border-radius:14px;background:#fff;padding:16px}
        .row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .person{display:flex;align-items:center;gap:12px}
        .avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#eef2ff}
        .btn{padding:8px 12px;border-radius:10px;border:1px solid #cbd5ff;background:#eef2ff;color:#3f46d8!important;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}

        /* Pager (▲ ▼) */
        .pager{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin-top:8px}
        .pbtn{width:36px;height:36px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-weight:800}
        .pbtn:disabled{opacity:.5;cursor:not-allowed}
        .range{font-size:12px;color:var(--muted)!important;margin-right:auto}

        /* Overview tiles */
        .grid3{display:grid;grid-template-columns:1fr;gap:12px}
        .tile{border:1px solid #eee;border-radius:12px;background:#fff;padding:14px}
        .tileTitle{font-size:13px;color:var(--muted)!important;margin-bottom:6px}
        .tileVal{font-size:26px;font-weight:800}

        @media (max-width:980px){
          .su-layout{grid-template-columns:1fr}
          .su-side{display:none}
          .content{grid-template-columns:1fr}
        }
      `}</style>

      <div className="su-layout">
        {/* ===== Sidebar (исто како Startup.jsx) ===== */}
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
            onClick={() => { logout?.(); navigate("/login"); }}
          >
            Logout
          </button>
        </aside>

        {/* ===== Main ===== */}
        <main className="su-main">
          <div className="topbar">
            <input
              className="search"
              placeholder="Search mentor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chip">
              <div className="av">{chipInitial}</div>
              <div>{chipName}</div>
            </div>
          </div>

          <div className="content">
            {/* LEFT: mentors (3 per page) */}
            <section>
              <h2 style={{ margin: "6px 0 12px" }}>My Mentors</h2>

              <div className="cards">
                {pageItems.map((m) => (
                  <article key={m._id} className="card">
                    <div className="row">
                      <div className="person">
                        <img
                          className="avatar"
                          alt=""
                          src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(m.name || "M")}`}
                        />
                        <div>
                          <h3 style={{ margin: "0 0 4px" }}>{m.name || "Unnamed mentor"}</h3>
                          <div style={{ fontSize: 13, opacity: .75 }}>{m.email}</div>

                          {Array.isArray(m.skills) && m.skills.length > 0 && (
                            <div style={{ marginTop: 6, fontSize: 13 }}>
                              <b>Skills:</b> {m.skills.join(", ")}
                            </div>
                          )}
                          {m.bio && (
                            <div style={{ marginTop: 6, fontSize: 13, opacity: .9 }}>
                              {m.bio}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Link className="btn" to={`/job-offer/${m._id}`}>View Mentor</Link>
                      </div>
                    </div>
                  </article>
                ))}

                {filtered.length === 0 && (
                  <div className="card" style={{ borderStyle: "dashed", color: "#6b7280" }}>
                    No mentors match your search.
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <div className="pager">
                  <span className="range">
                    {start + 1}&ndash;{end} of {filtered.length}
                  </span>
                  <button
                    className="pbtn"
                    title="Previous"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    ▲
                  </button>
                  <button
                    className="pbtn"
                    title="Next"
                    disabled={page >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    ▼
                  </button>
                </div>
              )}
            </section>

            {/* RIGHT: Quick Overview */}
            <aside>
              <div className="panel" style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Quick Overview</h3>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>In the last month</div>
              </div>

              <div className="grid3">
                <div className="tile">
                  <div className="tileTitle">Total Mentors</div>
                  <div className="tileVal">{overview.totalMentors}</div>
                </div>
                <div className="tile">
                  <div className="tileTitle">Total Assigned Jobs</div>
                  <div className="tileVal">{overview.assigned}</div>
                </div>
                <div className="tile" style={{ background: "#f3f0ff" }}>
                  <div className="tileTitle">Finished Jobs</div>
                  <div className="tileVal">{overview.finished}</div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ==== Исти икони како во Startup.jsx ==== */
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
