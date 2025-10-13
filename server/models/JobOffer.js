// models/JobOffer.js
const mongoose = require('mongoose');

const JobOfferSchema = new mongoose.Schema(
  {
    jobId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job',     required: true },
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    mentorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor',  required: true },

    shortName:   { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },

    status: { 
      type: String, 
      enum: ['pending', 'inprogress', 'rejected', 'cancelled'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// по желба: една понуда по (job, mentor)
JobOfferSchema.index({ jobId: 1, mentorId: 1 }, { unique: true });

// за брзо листање „pending“ по ментор
JobOfferSchema.index({ mentorId: 1, status: 1 });

module.exports = mongoose.model('JobOffer', JobOfferSchema);
