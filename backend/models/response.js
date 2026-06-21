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
  },

  // Timing fields to support funnel & completion time KPIs
  startedAt: { type: Date },
  submittedAt: { type: Date },
  // duration in seconds (submittedAt - startedAt)
  durationSeconds: { type: Number, min: 0 }
}, { timestamps: true });

// Indexes for faster queries
responseSchema.index({ surveyId: 1, createdAt: -1 });
responseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });
responseSchema.index({ status: 1 });
responseSchema.index({ surveyId: 1, status: 1 });
responseSchema.index({ userId: 1, status: 1 });

// Compute submittedAt and duration when status becomes submitted
responseSchema.pre('save', function() {
  try {
    if (this.isModified('status') && this.status === 'submitted') {
      if (!this.submittedAt) this.submittedAt = new Date();
      if (this.startedAt && this.submittedAt) {
        const diff = (this.submittedAt.getTime() - this.startedAt.getTime()) / 1000;
        this.durationSeconds = diff > 0 ? Math.round(diff) : 0;
      }
    }
  } catch (err) {
    console.error('response pre-save timing calc error', err);
  }
});

module.exports = mongoose.model('Response', responseSchema);