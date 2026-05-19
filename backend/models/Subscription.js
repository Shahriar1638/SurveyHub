const mongoose = require('mongoose');

// ── Credit Ledger (Usage Tracking) ──────────────────────────────────────────
const creditTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['purchase', 'survey_creation', 'ai_analysis', 'refund', 'bonus'],
      required: true,
    },
    credits: {
      type: Number,
      required: true, // e.g., +100 for purchase, -5 for survey, -2 for AI
    },
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      default: null,
    },
    description: {
      type: String,
      required: true, // e.g., "Created survey 'Tech Trends'" or "Refund of 20 unused credits"
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ── Monetary Transactions (Stripe Linkage) ──────────────────────────────────
const billingEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['purchase', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // e.g., 20.00
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
      trim: true,
    },
    creditsTransacted: {
      type: Number,
      required: true, // e.g., +200 or -50
    },
    providerPaymentIntentId: {
      type: String, // Stripe PaymentIntent / Session ID for tracking
      required: true,
      trim: true,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ── Main Billing/Wallet Schema ──────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One credit wallet/subscription per user (automatically indexes)
    },
    providerCustomerId: {
      type: String,
      default: '',
      trim: true,
    },
    // Current credit status
    balance: {
      type: Number,
      default: 0,
      min: 0, // Prevents balance from dropping below zero (transaction isolation)
    },
    totalPurchased: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    // Historical Logs
    creditLedger: [creditTransactionSchema],
    billingHistory: [billingEventSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);