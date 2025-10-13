const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  location: String,
  industry: String,
  description: String,
});

module.exports = mongoose.model('Company', companySchema);
