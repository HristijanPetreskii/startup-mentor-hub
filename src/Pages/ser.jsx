// server.js
const express = require('express');
const mongoose = require('mongoose');
const jobsRouter = require('./Api');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('finalTask/Backend/server.js/job', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());

// Use the jobs route
app.use('/api/jobs', jobsRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
