import axios from "axios";

const JobCard = ({ job }) => {
    const handleApply = async () => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));

            if (!token || !user) {
                alert("You must be logged in to apply!");
                return;
            }

            const res = await axios.post(
                "http://localhost:3001/apply",
                { mentorId: user.id, jobId: job._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data) {
                alert("Application submitted successfully!");
            }
        } catch (error) {
            console.error("Error applying for job:", error);
            alert("Failed to apply. You may have already applied.");
        }
    };

    return (
        <div className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <button onClick={handleApply}>Apply</button>
        </div>
    );
};

export default JobCard;
