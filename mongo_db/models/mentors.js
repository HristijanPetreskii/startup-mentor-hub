const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  skills: [String],
  desc: String,
  acceptedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('Mentor', mentorSchema);
