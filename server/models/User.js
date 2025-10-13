const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false }, // Направено незадолжително
    desc: { type: String, required: false }, // Направено незадолжително
    acceptedjobs: { type: Array, required: false } // Направено незадолжително
});

const MentorModel = mongoose.model('Mentor', MentorSchema);
module.exports = MentorModel;
