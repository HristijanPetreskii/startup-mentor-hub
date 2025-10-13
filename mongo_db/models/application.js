const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  status: String,
});

module.exports = mongoose.model('Application', applicationSchema);
