// server/models/Startup.js (освежи)
const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  email:  { type: String, required: true, unique: true, lowercase: true, index: true },
  password:{ type: String, required: true },
  role:   { type: String, enum: ['startup'], default: 'startup' },
  address:{ type: String, default: '' },
  representative:{ type: String, default: '' },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

module.exports = mongoose.model('Startup', StartupSchema);
