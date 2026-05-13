const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', index: true },
  userEmail: String,
  
  // Capture answers as they were submitted
  answers: [
    {
      questionId: String,
      label: String, // "e.g. How satisfied are you?"
      value: mongoose.Schema.Types.Mixed // String for text, Array for checkboxes, Number for scale
    }
  ]
}, { timestamps: true });

// Indexes for faster queries
responseSchema.index({ userEmail: 1 });
responseSchema.index({ surveyId: 1, createdAt: -1 });

module.exports = mongoose.model('Response', responseSchema);