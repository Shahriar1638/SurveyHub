const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  surveyorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  useCase: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const wordCount = v.trim().split(/\s+/).length;
        return wordCount <= 20;
      },
      message: 'Use case must not exceed 20 words'
    }
  },
  
  // THE DYNAMIC ARRAY: This handles n questions automatically
  questions: [
    {
      id: { type: String, required: true }, // unique frontend ID
      label: { type: String, required: true }, // The Question text
      type: { 
        type: String, 
        enum: ['short_answer', 'paragraph', 'multiple_choice', 'checkbox', 'linear_scale'],
        required: true 
      },
      options: [String], // Array of choices (empty for text questions)
      required: { type: Boolean, default: false }
    }
  ],
  
  status: { type: String, enum: ['active', 'expired', 'banned'], default: 'active' },
  category: String,
  deadline: {
      type: String,
      required: true,
      trim: true,
    },
  image: String
}, { timestamps: true });

// Indexes for faster queries
surveySchema.index({ surveyorId: 1 });
surveySchema.index({ status: 1 });
surveySchema.index({ category: 1 });
surveySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Survey', surveySchema);