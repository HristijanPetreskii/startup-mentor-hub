import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState(""); // CSV: "Sales, Management"
  const [status, setStatus] = useState("open");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    try {
      const payload = {
        title,
        description,
        skillsRequired: skills, // бекендот прифаќа и CSV и низа
        status,
      };
      const res = await api.post("/create-job", payload);
      setOk("Job created!");
      // назад кон листата
      setTimeout(() => navigate("/startup/jobs"), 700);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  return (
    <div style={{maxWidth: 680, margin: "24px auto", padding: "0 16px"}}>
      <h2>Create Job</h2>
      {err && <p style={{color:"red"}}>{err}</p>}
      {ok && <p style={{color:"green"}}>{ok}</p>}

      <form onSubmit={submit} style={{display:"grid", gap:12}}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{padding:10, borderRadius:8, border:"1px solid #ddd"}}
        />
        <textarea
          placeholder="Description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{padding:10, borderRadius:8, border:"1px solid #ddd"}}
        />
        <input
          placeholder="Skills (comma separated) e.g. Sales, Management"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={{padding:10, borderRadius:8, border:"1px solid #ddd"}}
        />
        <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{padding:10, borderRadius:8}}>
          <option value="open">open</option>
          <option value="inprogress">inprogress</option>
          <option value="done">done</option>
          <option value="rejected">rejected</option>
        </select>

        <div style={{display:"flex", gap:8}}>
          <button type="submit" style={{padding:"10px 14px", borderRadius:8, cursor:"pointer"}}>Create</button>
          <button type="button" onClick={()=>navigate("/startup/jobs")} style={{padding:"10px 14px", borderRadius:8}}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
