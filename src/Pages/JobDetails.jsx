import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Pages/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

const JobDetails = () => {
    const { user } = useContext(AuthContext);
    const { jobId } = useParams(); // Презема jobId од URL
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/jobs/${jobId}`);
                setJob(res.data);
            } catch (error) {
                console.error("Error fetching job details:", error);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleApply = async () => {
        if (!user || user.role !== "mentor") {
            alert("You need to be logged in as a mentor to apply.");
            return;
        }

        try {
            const token = localStorage.getItem("token"); // Преземи токен
            const res = await axios.post(
                "http://localhost:3001/apply",
                {
                    mentorId: user.id, // Провери дали користиш user.id или user._id
                    jobId
                },
                {
                    headers: { Authorization: `Bearer ${token}` } // Додај токен
                }
            );
            alert(res.data.message);
        } catch (err) {
            console.error("Application failed:", err);
            alert("Application failed.");
        }
    };

    return (
        <div>
            <h2>Job Details</h2>
            {job ? (
                <div>
                    <p><strong>Title:</strong> {job.title}</p>
                    <p><strong>Description:</strong> {job.description}</p>
                    <button onClick={handleApply}>Apply</button>
                </div>
            ) : (
                <p>Loading job details...</p>
            )}
        </div>
    );
};

export default JobDetails;
