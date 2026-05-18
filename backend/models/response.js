const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Capture answers as they were submitted
  answers: [
    {
      questionId: String,
      label: String, // "e.g. How satisfied are you?"
      value: mongoose.Schema.Types.Mixed // String for text, Array for checkboxes, Number for scale
    }
  ],
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  }
}, { timestamps: true });

// Indexes for faster queries
responseSchema.index({ surveyId: 1, createdAt: -1 });
responseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });
responseSchema.index({ status: 1 });
responseSchema.index({ surveyId: 1, status: 1 });
responseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Response', responseSchema);