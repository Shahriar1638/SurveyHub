const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  surveyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Survey', 
    required: true 
  },
  reporterEmail: { type: String, required: true },
  reportReason: { 
    type: String, 
    enum: ['Spam', 'Hate Speech', 'Inappropriate Content', 'Other'], 
    required: true 
  },
  details: String, // User's explanation
  
  // --- ADMIN RESPONSE HANDLING ---
  status: { 
    type: String, 
    enum: ['pending', 'investigating', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  adminResponse: {
    adminEmail: String,
    message: String, // e.g., "The survey has been removed for violating terms."
    actionTaken: { 
        type: String, 
        enum: ['None', 'Survey Deleted', 'Surveyor Warned', 'Surveyor Banned'] 
    },
    respondedAt: Date
  }
}, { timestamps: true });

// Indexes for faster queries
reportSchema.index({ status: 1 });
reportSchema.index({ surveyId: 1 });
reportSchema.index({ reporterEmail: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);