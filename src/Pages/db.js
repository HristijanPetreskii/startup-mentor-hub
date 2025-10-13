const mongoose = require('mongoose');

// Replace with your actual MongoDB connection string
mongoose.connect('mongodb://localhost:27017/semos_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});
