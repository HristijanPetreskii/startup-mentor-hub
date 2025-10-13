const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For hashing passwords

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  skils: {
    type: [String], // Array of skills
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  acceptedjobs: {
    type: String,
    required: true
  }
});

// Middleware to hash password before saving
EmployeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const EmployeeModel = mongoose.model('mentor', EmployeeSchema);

module.exports = EmployeeModel;
