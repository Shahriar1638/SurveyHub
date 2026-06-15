const mongoose = require('mongoose');

const pricingPackageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceCurrency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    perCredit: {
      type: Number,
      required: true,
    },
    maxSurveys: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PricingPackage || mongoose.model('PricingPackage', pricingPackageSchema);
