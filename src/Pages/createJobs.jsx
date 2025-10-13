// src/Pages/CreateJob.jsx
import React, { useMemo, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Pages/AuthContext"; // <-- ако ти е на друго место, смени патека

export default function CreateJob() {
  const navigate = useNavigate();
  const { token: ctxToken } = useContext(AuthContext); // <-- користи го ако го имаш
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [status, setStatus] = useState("open");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const skillsPreview = useMemo(
    () =>
      skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [skillsRequired]
  );

  function getToken() {
    // 1) ако имаш во context
    if (ctxToken) return ctxToken;

    // 2) инаку од localStorage
    let t = localStorage.getItem("token");
    if (!t) return null;

    // ако е снимено со наводници (JSON.stringify), исчисти ги:
    try {
      const maybeParsed = JSON.parse(t);
      if (typeof maybeParsed === "string") t = maybeParsed;
    } catch {
      // не е JSON, продолжи како string
    }

    // ако некој го зачувал со префикс "Bearer ", исчисти за да не дуплираме
    return t.replace(/^Bearer\s+/i, "").trim();
  }

  async function handleCreateJob(e) {
    e.preventDefault();
    if (!title || !description || !skillsRequired || !status) {
      setErr("All fields are required.");
      return;
    }
    setErr("");

    const rawToken = getToken();
    if (!rawToken) {
      setErr("Please login first.");
      return;
    }

    try {
      setSubmitting(true);

      const headers = {
        // корректен Authorization header
        Authorization: `Bearer ${rawToken}`,
        // и fallback ако серверот го чита вака
        "x-auth-token": rawToken,
        "Content-Type": "application/json",
      };

      const payload = { title, description, skillsRequired, status };

      const res = await axios.post(
        "http://localhost:3001/create-job", // смени ако ти е друга рута, пр. "/api/jobs"
        payload,
        { headers }
      );

      if (res.data?.success) {
        navigate("/startup/jobs");
      } else {
        setErr(res.data?.message || "Job creation failed.");
      }
    } catch (e) {
      // покриј типични JWT грешки
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error creating job.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cj-wrap">
      <style>{`
        .cj-wrap{--ink:#111;--muted:#6b7280;--accent:#6366f1;background:#f8fafc;min-height:100vh}
        .cj-wrap,*{box-sizing:border-box;color:var(--ink)!important}
        .shell{max-width:860px;margin:0 auto;padding:28px 18px}
        .title{font-size:28px;font-weight:800;margin:4px 0 16px}
        .card{background:#fff;border:1px solid #eee;border-radius:14px;padding:18px}
        .row{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:14px}
        .lbl{font-size:13px;color:var(--muted)!important}
        .inp,.sel,.txt{width:100%;padding:12px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;font-size:14px}
        .txt{min-height:120px;resize:vertical;line-height:1.5}
        .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
        .chip{font-size:12px;background:#f2f4ff;border:1px solid #e5e8ff;padding:4px 8px;border-radius:999px}
        .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:6px}
        .btn{padding:10px 14px;border-radius:10px;border:1px solid #cbd5ff;background:#eef2ff;color:#3f46d8!important;font-weight:700;cursor:pointer}
        .btn.primary{background:#6366f1;border-color:#6366f1;color:#fff!important}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:10px 12px;border-radius:10px;font-size:14px;margin-bottom:10px}
      `}</style>

      <div className="shell">
        <h1 className="title">Create Job</h1>
        <section className="card">
          {err && <div className="err">{err}</div>}
          <form onSubmit={handleCreateJob}>
            <div className="row">
              <label className="lbl">Title</label>
              <input className="inp" type="text" placeholder="e.g. Sales Funnel Review" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="row">
              <label className="lbl">Description</label>
              <textarea className="txt" placeholder="Describe the task, deliverables, expectations…" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="row">
              <label className="lbl">Skills Required (comma separated)</label>
              <input className="inp" type="text" placeholder="Sales, KPI dashboards, Pitch deck…" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} />
              {!!skillsPreview.length && (
                <div className="chips">
                  {skillsPreview.map((s, i) => (
                    <span key={i} className="chip">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="row">
              <label className="lbl">Status</label>
              <select className="sel" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="actions">
              <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={submitting}>
                {submitting ? "Creating…" : "Create Job"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
