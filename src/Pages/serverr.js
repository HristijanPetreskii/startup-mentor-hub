// Import syntax for ES Modules
import express from 'express';
import mongoose from 'mongoose';

// Rest of your code
const app = express();
mongoose.connect('mongodb://localhost:27017/semos_project', { useNewUrlParser: true, useUnifiedTopology: true });

const mentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: [String],
  desc: String,
  acceptedJobs: [String]
});

const Mentor = mongoose.model('Mentor', mentorSchema);

app.get('/api/mentor/:id', async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);
  res.json(mentor);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
