// src/Pages/JobOfferPage.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import tokenIcon from "../assets/ic_outline-token.png";

export default function JobOfferPage() {
  const { mentorId } = useParams();
  const { user, token, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [apps, setApps] = useState([]);      // applications за овој ментор (само мои)
  const [offers, setOffers] = useState([]);  // мои offers кон овој ментор
  const [myJobs, setMyJobs] = useState([]);  // за форма

  const [tab, setTab] = useState("all");     // all | inprogress | done | cancelled
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // форма за Offer New Job (модала)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ jobId: "", shortName: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const authH = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  const isActive = (p) => location.pathname === p;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setErr("");

        // mentor info
        try {
          const m1 = await axios.get(`http://localhost:3001/mentors/${mentorId}`);
          if (!cancelled) setMentor(m1.data?.mentor);
        } catch {
          const m2 = await axios.get("http://localhost:3001/mentors");
          const found = (m2.data || []).find((x) => x._id === mentorId);
          if (!cancelled) setMentor(found || null);
        }

        // applications за овој ментор, но само од мој стартaп
        const aRes = await axios.get(`http://localhost:3001/applications/${mentorId}`);
        const onlyMine = (aRes.data || []).filter((a) => String(a?.jobId?.companyId) === String(user?.id));
        if (!cancelled) setApps(onlyMine);

        // мои offers кон овој ментор
        const oRes = await axios.get("http://localhost:3001/my-offers", { headers: authH });
        const onlyForMentor = (oRes.data?.offers || []).filter(
          (o) => String(o.mentorId?._id || o.mentorId) === String(mentorId)
        );
        if (!cancelled) setOffers(onlyForMentor);

        // мои jobs за форма
        const jRes = await axios.get("http://localhost:3001/my-jobs", { headers: authH });
        if (!cancelled) setMyJobs(jRes.data?.jobs || []);
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mentorId, user?.id, authH]);

  // ако немаме избрано job, а имаме барем еден – избери прв кога ќе се отвори модалот
  useEffect(() => {
    if (showForm && !form.jobId && myJobs.length > 0) {
      setForm((f) => ({ ...f, jobId: String(myJobs[0]._id || "") }));
    }
  }, [showForm, myJobs, form.jobId]);

  const assignedFiltered = useMemo(() => {
    if (tab === "all") return apps;
    if (tab === "inprogress") return apps.filter((a) => a.status?.toLowerCase().includes("progress"));
    if (tab === "done") return apps.filter((a) => a.status?.toLowerCase() === "done");
    if (tab === "cancelled") {
      return apps.filter((a) => ["rejected", "cancelled"].includes(String(a.status).toLowerCase()));
    }
    return apps;
  }, [apps, tab]);

  async function cancelOffer(offerId) {
    try {
      await axios.post("http://localhost:3001/cancel-job-offer", { offerId }, { headers: authH });
      setOffers((prev) => prev.map((o) => (o._id === offerId ? { ...o, status: "cancelled" } : o)));
    } catch (e) {
      alert(e.response?.data?.message || "Cancel failed");
    }
  }

  async function submitOffer(e) {
    e.preventDefault();

    // користи вградено HTML5 валидации (required, minlength и сл.)
    const formEl = e.currentTarget;
    if (formEl && !formEl.reportValidity()) return;

    const jobId = String(form.jobId || "").trim();
    const shortName = String(form.shortName || "").trim();
    const description = String(form.description || "").trim();

    if (!jobId || !shortName || !description) {
      // дополнителна заштита ако некој input е само празни места
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        "http://localhost:3001/offer-job",
        {
          jobId,
          startupId: user?.id,
          mentorId,
          shortName,
          description,
        },
        { headers: authH }
      );

      // рефреш на offers
      const oRes = await axios.get("http://localhost:3001/my-offers", { headers: authH });
      const onlyForMentor = (oRes.data?.offers || []).filter(
        (o) => String(o.mentorId?._id || o.mentorId) === String(mentorId)
      );
      setOffers(onlyForMentor);

      // ресет форма
      setShowForm(false);
      setForm({ jobId: "", shortName: "", description: "" });
    } catch (e) {
      alert(e.response?.data?.message || "Offer failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: 16, color: "#111" }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;
  if (!mentor) return <div style={{ padding: 16 }}>Mentor not found.</div>;

  // UI vars
  const chipName = user?.companyName || user?.name || user?.email || "Startup";
  const chipInitial = chipName?.charAt(0)?.toUpperCase();

  return (
    <div className="su-wrap">
      <style>{`
        .su-wrap{--accent:#6366f1;--ink:#111;--muted:#6b7280;background:#f8fafc;min-height:100vh}
        .su-wrap, .su-wrap *{color:var(--ink)!important;box-sizing:border-box}
        .su-layout{display:grid;grid-template-columns:260px 1fr;max-width:1280px;margin:0 auto}
        .su-side{background:#fff;border-right:1px solid #eef2f7;padding:18px 14px;display:flex;flex-direction:column;gap:12px;min-height:100vh}
        .brand{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:.2px;font-size:18px;padding:4px 6px}
        .brand img{width:60px;height:60px;border-radius:12px}
        .nav{display:flex;flex-direction:column;gap:8px;margin-top:6px;padding-right:6px}
        .navitem{position:relative;display:grid;grid-template-columns:28px 1fr;align-items:center;gap:10px;font-size:17px;font-weight:700;padding:12px 14px;border-radius:12px;color:#374151!important;cursor:pointer;border:1px solid transparent;text-decoration:none}
        .navitem:hover{background:#f3f4ff}
        .navitem.active{background:#ecebff;color:#3f46d8!important;border:1px solid #cbd5ff}
        .navitem.active::after{content:"";position:absolute;right:-8px;top:6px;bottom:6px;width:3px;background:var(--accent);border-radius:4px}
        .navitem .icon{width:22px;height:22px;display:inline-grid;place-items:center}
        .logout{color:#3b82f6!important;font-weight:700;border:none;background:none;cursor:pointer;padding:10px 12px;border-radius:10px;margin-top:auto}
        .su-main{padding:20px}
        .topbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .search{width:360px;max-width:100%;padding:10px 12px;border-radius:12px;border:1px solid #e5e7eb}
        .chip{margin-left:auto;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:6px 10px}
        .chip .av{width:28px;height:28px;border-radius:50%;background:#eef2ff;display:grid;place-items:center;font-weight:800;color:#3f46d8!important}
        .profile{display:grid;grid-template-columns:360px 1fr;gap:16px;margin-bottom:16px}
        .panel{border:1px solid #e5e7eb;border-radius:12px;background:#fff;padding:16px}
        .mentorCard{display:flex;gap:14px}
        .mentorPic{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#eef2ff}
        .aboutHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .btnPrimary{padding:8px 12px;border-radius:10px;border:1px solid #cbd5ff;background:#eef2ff;color:#3f46d8!important;font-weight:700;cursor:pointer}
        .btnThin{padding:6px 10px;border-radius:10px;border:1px solid #f9a8d4;background:#fff;color:#be185d!important;font-weight:700;cursor:pointer}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tabs{display:flex;gap:8px;margin-bottom:10px}
        .pill{border:1px solid #e5e7eb;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;background:#f7f7f8}
        .pill.active{border-color:#6366f1;background:#eef2ff;color:#3730a3!important}
        .row{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #f0f0f0;border-radius:10px;padding:10px 12px}
        .status{font-size:12px;border-radius:999px;padding:4px 10px;border:1px solid transparent}
        .status.done{background:#e8fff3;border-color:#b7f0cf;color:#0a7f49}
        .status.progress{background:#eef2ff;border-color:#dfe3ff;color:#3f46d8}
        .status.cancel{background:#ffecec;border-color:#ffd0d0;color:#b42318}
        .modalOverlay{position:fixed;inset:0;background:rgba(17,24,39,.38);backdrop-filter:blur(2px);display:grid;place-items:center;z-index:50}
        .modalCard{position:relative;width:min(92vw,560px);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.22);padding:18px}
        .modalTitle{font-weight:800;font-size:20px;margin-bottom:10px}
        .modalBody{display:grid;gap:10px}
        .modalClose{position:absolute;top:8px;right:10px;border:none;background:transparent;font-size:22px;line-height:1;color:#6b7280;cursor:pointer}
        @media (max-width: 980px){
          .su-layout{grid-template-columns:1fr}
          .su-side{display:none}
          .profile{grid-template-columns:1fr}
          .grid2{grid-template-columns:1fr}
        }
      `}</style>

      <div className="su-layout">
        {/* ===== Sidebar (same look as Startup.jsx) ===== */}
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

        {/* ===== Main ===== */}
        <main className="su-main">
          {/* Top bar: search + company chip */}
          <div className="topbar">
            <input className="search" placeholder="Search Startup, KPI, Mentor…" />
            <div className="chip"><div className="av">{chipInitial}</div><div>{chipName}</div></div>
          </div>

          {/* Mentor card + About */}
          <div className="profile">
            <section className="panel">
              <div className="mentorCard">
                <img
                  className="mentorPic"
                  alt=""
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(mentor.name || "M")}`}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{mentor.name || "Mentor"}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {mentor.title || "Sales Representative"}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>{mentor.email}</div>
                  {mentor.phone && <div style={{ fontSize: 13 }}>{mentor.phone}</div>}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="aboutHead">
                <div style={{ fontWeight: 800 }}>About Mentor</div>
                <button
                  className="btnPrimary"
                  onClick={() => {
                    setShowForm(true);
                    // ако нема избрано, а има листа – избери прв
                    if (!form.jobId && myJobs.length > 0) {
                      setForm((f) => ({ ...f, jobId: String(myJobs[0]._id || "") }));
                    }
                  }}
                >
                  + Offer New Job
                </button>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                <b>Skills:</b>{" "}
                {Array.isArray(mentor.skills) && mentor.skills.length
                  ? mentor.skills.join(" | ")
                  : "—"}
              </div>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                {mentor.bio ||
                  "Lorem ipsum dolor sit amet consectetur, Suspendisse quis varius felis augue adipiscing. Sapien volutpat ac velit facilisis fermentum diam blandit nunc."}
              </p>
            </section>
          </div>

          {/* ===== Assigned + Pending Offers ===== */}
          <div className="grid2">
            <section className="panel">
              <h3 style={{ marginTop: 0 }}>Assigned Jobs</h3>
              <div className="tabs">
                {[
                  { k: "all", label: "All" },
                  { k: "done", label: "Done" },
                  { k: "cancelled", label: "Canceled" },
                  { k: "inprogress", label: "In Progress" },
                ].map(({ k, label }) => (
                  <button
                    key={k}
                    className={`pill ${tab === k ? "active" : ""}`}
                    onClick={() => setTab(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ display:"grid", gap:8 }}>
                {assignedFiltered.map((a) => (
                  <OfferRow
                    key={a._id}
                    left={a.jobId?.title || "Untitled job"}
                    status={a.status}
                  />
                ))}
                {assignedFiltered.length === 0 && (
                  <div style={{ fontSize:13, color:"var(--muted)" }}>No items.</div>
                )}
              </div>
            </section>

            <section className="panel">
              <h3 style={{ marginTop: 0 }}>Pending Job Offers</h3>
              <div style={{ display:"grid", gap:8 }}>
                {offers
                  .filter((o) => String(o.status).toLowerCase() === "pending")
                  .map((o) => (
                    <OfferRow
                      key={o._id}
                      left={o.shortName || o.jobId?.title || "Job offer"}
                      status="PENDING"
                      action={
                        <button className="btnThin" onClick={() => cancelOffer(o._id)}>
                          Cancel Offer
                        </button>
                      }
                    />
                  ))}
                {offers.filter((o) => String(o.status).toLowerCase() === "pending").length === 0 && (
                  <div style={{ fontSize:13, color:"var(--muted)" }}>No pending offers.</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ===== Modal: Offer Job ===== */}
      {showForm && (
        <div className="modalOverlay" onClick={() => setShowForm(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={() => setShowForm(false)}>×</button>
            <div className="modalTitle">OFFER JOB</div>

            <form onSubmit={submitOffer} className="modalBody" noValidate>
              <div>
                <label style={{ fontSize:13, color:"var(--muted)" }}>Choose one of your jobs</label>
                <select
                  value={form.jobId}
                  onChange={(e) => setForm((f) => ({ ...f, jobId: e.target.value }))}
                  required
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
                >
                  {/* ако нема jobs, ќе има само disabled опција */}
                  {myJobs.length === 0 ? (
                    <option value="" disabled>
                      You have no jobs. Create a job first.
                    </option>
                  ) : (
                    <>
                      <option value="">-- select job --</option>
                      {myJobs.map((j) => (
                        <option key={j._id} value={j._id}>
                          {j.title} ({j.status})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <input
                placeholder="Short name"
                value={form.shortName}
                onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                required
                minLength={2}
                style={{ padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
              />

              <textarea
                placeholder="Short Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                minLength={5}
                style={{ padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
              />

              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button
                  type="button"
                  className="btnPrimary"
                  style={{ background:"#fff" }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btnPrimary"
                  disabled={submitting || myJobs.length === 0}
                  type="submit"
                  title={myJobs.length === 0 ? "Create a job first" : undefined}
                >
                  {submitting ? "Sending…" : "Send Job Offer"}
                </button>
              </div>
            </form>

            {myJobs.length === 0 && (
              <div style={{ marginTop:8, fontSize:12, color:"var(--muted)" }}>
                Tip: You currently have no jobs to offer. Go to <b>Jobs</b> and create one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OfferRow({ left, status, action }) {
  const v = String(status || "").toLowerCase();
  const cls =
    v.includes("done") ? "status done" :
    v.includes("progress") ? "status progress" :
    v.includes("reject") || v.includes("cancel") || v.includes("pending") ? "status cancel" :
    "status";

  return (
    <div className="row">
      <div>{left}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className={cls}>{String(status || "-").toUpperCase()}</span>
        {action}
      </div>
    </div>
  );
}

/* ====== Tiny sidebar icons (како во Startup.jsx) ====== */
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
