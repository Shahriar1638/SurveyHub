/**
 * Credit cost configuration for platform actions.
 * These constants control how many credits are deducted per action.
 */
const CREDIT_COSTS = {
  SURVEY_CREATION: 5,
  BLOG_CREATION: 2,
};

/**
 * Deduct credits from a user's wallet and log the transaction.
 *
 * @param {ObjectId} userId - The user's _id
 * @param {number} amount - Positive number of credits to deduct
 * @param {string} type - Ledger type: 'survey_creation' | 'ai_analysis'
 * @param {string} description - Human-readable description
 * @param {ObjectId} [refId] - Optional reference ID (surveyId, blogId)
 * @returns {Promise<{success: boolean, balance?: number, error?: string}>}
 */
async function deductCredits(userId, amount, type, description, refId = null) {
  const Subscription = require('../models/Subscription');

  if (!amount || amount <= 0) {
    return { success: false, error: 'Invalid deduction amount' };
  }

  // Atomic: check balance and decrement in one operation
  // $inc with negative value + $gte guard prevents race conditions
  const result = await Subscription.findOneAndUpdate(
    {
      userId,
      balance: { $gte: amount }, // only proceed if sufficient balance
    },
    {
      $inc: { balance: -amount, totalSpent: amount },
      $push: {
        creditLedger: {
          type,
          credits: -amount,
          surveyId: refId,
          description,
          occurredAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!result) {
    // Either no subscription doc or insufficient balance
    const sub = await Subscription.findOne({ userId }).lean();
    if (!sub) {
      return { success: false, error: 'No billing account found. Please purchase credits first.', balance: 0 };
    }
    return { success: false, error: 'Insufficient credits', balance: sub.balance };
  }

  return { success: true, balance: result.balance };
}

module.exports = { CREDIT_COSTS, deductCredits };
