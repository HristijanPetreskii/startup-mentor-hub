// routes/jobs.js
const express = require('express');
const Job = require('./Job');
const router = express.Router();

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
