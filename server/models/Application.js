// server/models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  jobId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status:   { type: String, enum: ['Pending','In Progress','Done','Rejected'], default: 'Pending' }
}, { timestamps: true });

ApplicationSchema.index({ mentorId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
