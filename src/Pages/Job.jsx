// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: { type: [String], required: true },
  status: { type: String, default: 'Open' },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
