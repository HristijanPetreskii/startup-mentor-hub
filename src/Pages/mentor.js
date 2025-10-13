import mongoose from 'mongoose'; // Use import for mongoose

const mentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  skills: [String],
  desc: String,
  acceptedJobs: [String],
});

const Mentor = mongoose.model('Mentor', mentorSchema);

export default Mentor; // Use export default
