import { useState, useEffect } from "react";
import axios from "axios";

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("http://localhost:3001/jobs");
                setJobs(response.data.jobs); // Снимање на работните позиции во state
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch jobs");
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Available Jobs</h2>
            {jobs.length === 0 ? (
                <p>No jobs available at the moment.</p>
            ) : (
                <div>
                    {jobs.map((job) => (
                        <div key={job._id} className="job-card">
                            <h3>{job.title}</h3>
                            <p>{job.description}</p>
                            <p><strong>Company:</strong> {job.companyId.name}</p> {/* Прикажување на името на стартапот */}
                            <p><strong>Status:</strong> {job.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobList;
