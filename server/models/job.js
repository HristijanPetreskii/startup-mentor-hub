const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skillsRequired: { type: [String], default: [] }, // <-- ARRAY од стрингови
  // За job објави најчесто е доволно open/closed
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
