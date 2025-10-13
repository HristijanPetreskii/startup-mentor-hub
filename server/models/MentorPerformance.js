const mongoose = require('mongoose');

const mentorPerformanceSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true, unique: true },
    completedJobs: { type: Number, default: 0, min: 0 },
    monthlyCompletedJobs: {
      type: Map,
      of: Number,               // клуч: 'YYYY-MM' → вредност: број на завршени
      default: () => ({})
    }
  },
  { timestamps: true }
);

// брзо рангирање по завршени работи
mentorPerformanceSchema.index({ completedJobs: -1 });

module.exports = mongoose.model('MentorPerformance', mentorPerformanceSchema);
