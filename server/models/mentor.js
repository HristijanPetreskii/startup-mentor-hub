const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  email:  { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role:   { type: String, enum: ['mentor'], default: 'mentor' },

  phone:  { type: String, default: '' },
  address:{ type: String, default: '' },

  avatarUrl: { type: String, default: '' },   // ✅ ново поле

  skills: { type: [String], default: [] },
  bio:    { type: String, default: '' },

  acceptedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

module.exports = mongoose.model('Mentor', MentorSchema);
