// src/Pages/AppliedJobs.jsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export default function AppliedJobs() {
  const { user, token, loading, isMentor } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;            // чекај да се ре-хидрира auth од localStorage
    if (!isMentor || !user?._id) {  // мора најавен ментор
      setBusy(false);
      return;
    }

    const run = async () => {
      try {
        setBusy(true);
        const res = await axios.get(`/applications/${user._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setApplications(res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load applications");
      } finally {
        setBusy(false);
      }
    };

    run();
  }, [loading, isMentor, user?._id, token]);

  if (loading || busy) return <p style={{ padding: 16 }}>Loading…</p>;
  if (!isMentor) return <p style={{ padding: 16 }}>Please log in as a mentor.</p>;
  if (err) return <p style={{ color: "red", padding: 16 }}>{err}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <h2>Jobs You Applied For</h2>

      {applications.length > 0 ? (
        <div style={{ display: "grid", gap: 12 }}>
          {applications.map(app => (
            <div key={app._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{app.jobTitle || "Untitled job"}</h3>
                  <p style={{ margin: 0, opacity: 0.85 }}>
                    {app.jobDescription || "No description"}
                  </p>
                </div>
                <span style={{
                  alignSelf: "start",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  background: "#f4f6ff",
                  border: "1px solid #dfe3ff"
                }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't applied for any jobs yet.</p>
      )}
    </div>
  );
}
