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
  
  status: { type: String, enum: ['draft', 'published', 'expired', 'banned', 'pending', 'pending_review', 'rejected'], default: 'draft' },
  publishedAt: Date,

  moderation: {
    decision: { type: String, enum: ['approved', 'rejected', 'pending'], default: undefined },
    reason: String,
    flaggedCategories: [String],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    appeal: {
      message: String,
      submittedAt: Date,
    },
  },
  category: String,
  participantCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  deadline: {
      type: String,
      required: true,
      trim: true,
    },
  image: String,

  // Soft delete
  deleted: { type: Boolean, default: false },
  deletedAt: Date,

  // AI INSIGHT: Generated when deadline expires + auto-gen enabled
  aiInsight: {
    enabled: { type: Boolean, default: false },
    autoGenerate: { type: Boolean, default: false },
    status: { type: String, enum: ['idle', 'pending', 'ready', 'failed'], default: 'idle' },
    
    generatedAt: Date,
    updatedAt: Date,
    
    stats: {
      totalResponses: Number,
      perQuestion: [
        {
          questionId: String,
          responseCount: Number,
          optionBreakdown: [
            {
              value: String,
              count: Number
            }
          ],
          topThemes: [String]
        }
      ]
    },
    
    summary: String,
    keyFindings: [String],
    recommendations: [String],
    
    modelInfo: {
      modelName: String,
      promptVersion: String
    }
  }
}, { timestamps: true });

// Indexes for faster queries
surveySchema.index({ surveyorId: 1, deleted: 1, createdAt: -1 });  // My Surveys list
surveySchema.index({ surveyorId: 1, deleted: 1, status: 1 });      // My Surveys filtered by status
surveySchema.index({ surveyorId: 1, deleted: 1, participantCount: -1 }); // My Surveys sorted by responses
surveySchema.index({ surveyorId: 1, deleted: 1, deadline: -1 });   // My Surveys sorted by deadline
surveySchema.index({ surveyorId: 1, deleted: 1 });                 // Recycle bin query
surveySchema.index({ status: 1, createdAt: -1 });                  // Admin: pending review queue
surveySchema.index({ status: 1, category: 1 });                    // Browse surveys by category
surveySchema.index({ status: 1, participantCount: -1, createdAt: -1 }); // Homepage top surveys

module.exports = mongoose.model('Survey', surveySchema);