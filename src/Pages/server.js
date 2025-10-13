import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());  // Enable CORS if needed
app.use(express.json());  // For parsing JSON data

// Define your job data (you can fetch this from MongoDB in a real scenario)
const jobs = [
    {
        _id: "5c0a65c52f8fb814b56fa193",
        companyId: "5c0a65c52f8fb814b56fa190",
        title: "Senior Software Engineer",
        description: "Developing scalable web applications using Node.js and React.",
        skillsRequired: ["Node.js", "React", "MongoDB"],
        status: "Open"
    }
];

app.get('/jobs', (req, res) => {
    res.json(jobs);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
