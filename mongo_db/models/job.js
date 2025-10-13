const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  postedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
