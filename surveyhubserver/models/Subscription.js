const mongoose = require('mongoose');

const billingEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['created', 'renewed', 'upgraded', 'downgraded', 'canceled', 'payment_failed', 'refunded'],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
      trim: true,
    },
    providerInvoiceId: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'stripe',
      trim: true,
    },
    providerCustomerId: {
      type: String,
      default: '',
      trim: true,
    },
    providerSubscriptionId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    plan: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing', 'incomplete', 'unpaid'],
      default: 'active',
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
    billingHistory: [billingEventSchema],
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ providerSubscriptionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);