const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PricingPackage = require('../models/PricingPackage');
const { verifyToken } = require('../middlewares/authMiddleware')();

// Helper: fetch package from DB by id
async function getPackage(packageId) {
  return PricingPackage.findOne({ id: packageId, active: true }).lean();
}

/**
 * POST /api/payments/create-checkout-session
 * Body: { packageId: 'starter' | 'growth' | 'pro' | 'enterprise', userId }
 * Creates a Stripe Checkout Session for one-time credit purchase.
 */
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { packageId, userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const pkg = await getPackage(packageId);
    if (!pkg) return res.status(400).json({ success: false, message: 'Invalid package' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get or create Stripe customer
    let wallet = await Subscription.findOne({ userId });
    let customerId = wallet?.providerCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pkg.priceCurrency || 'usd',
            unit_amount: Math.round(pkg.price * 100),
            product_data: {
              name: `SurveyHub ${pkg.name}`,
              description: `${pkg.credits} survey credits — never expire`,
              images: [],
            },
          },
        },
      ],
      metadata: {
        userId: userId.toString(),
        packageId,
        credits: pkg.credits.toString(),
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/payments/webhook
 * Stripe webhook: fulfil credit purchase after successful payment.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, packageId, credits } = session.metadata;
    const creditCount = parseInt(credits, 10);

    // Fetch package name from DB for ledger description
    const pkg = await getPackage(packageId);
    const pkgLabel = pkg?.name || packageId;

    try {
      // Upsert the wallet — add credits atomically
      await Subscription.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: creditCount, totalPurchased: creditCount },
          $set: { providerCustomerId: session.customer },
          $push: {
            creditLedger: {
              type: 'purchase',
              credits: creditCount,
              description: `Purchased ${pkgLabel} (${creditCount} credits)`,
              occurredAt: new Date(),
            },
            billingHistory: {
              eventType: 'purchase',
              amount: session.amount_total / 100,
              currency: session.currency,
              creditsTransacted: creditCount,
              providerPaymentIntentId: session.payment_intent || session.id,
              occurredAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      // Promote user to surveyor (one-way, never reverted) + sync subscription
      await User.findByIdAndUpdate(userId, {
        role: 'surveyor',
        subscription: {
          plan: packageId,
          status: 'active',
          autoRenew: false,
          provider: 'stripe',
          providerCustomerId: session.customer || '',
          providerSubscriptionId: session.subscription || '',
          currentPeriodEnd: null,
        },
      });
    } catch (dbErr) {
      console.error('Webhook DB error:', dbErr);
      return res.status(500).json({ error: 'Fulfillment failed' });
    }
  }

  res.json({ received: true });
});

/**
 * GET /api/payments/wallet/:userId
 * Returns balance + recent ledger for a user.
 */
router.get('/wallet/:userId', verifyToken, async (req, res) => {
  try {
    const wallet = await Subscription.findOne({ userId: req.params.userId }).lean();
    res.json({ success: true, data: wallet || { balance: 0, totalPurchased: 0, totalSpent: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/payments/verify-session/:sessionId
 * Called by the success page to confirm payment completion.
 */
router.get('/verify-session/:sessionId', verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      const { userId, packageId, credits } = session.metadata;
      const creditCount = parseInt(credits, 10);

      // Check if this payment intent/session has already been processed to prevent duplicates
      const paymentIntentId = session.payment_intent || session.id;
      const alreadyCredited = await Subscription.findOne({
        userId,
        'billingHistory.providerPaymentIntentId': paymentIntentId,
      });

      if (!alreadyCredited) {
        // Fetch package name from DB for ledger description
        const pkg = await getPackage(packageId);
        const pkgLabel = pkg?.name || packageId;

        // Run fulfillment
        await Subscription.findOneAndUpdate(
          { userId },
          {
            $inc: { balance: creditCount, totalPurchased: creditCount },
            $set: { providerCustomerId: session.customer },
            $push: {
              creditLedger: {
                type: 'purchase',
                credits: creditCount,
                description: `Purchased ${pkgLabel} (${creditCount} credits)`,
                occurredAt: new Date(),
              },
              billingHistory: {
                eventType: 'purchase',
                amount: session.amount_total / 100,
                currency: session.currency,
                creditsTransacted: creditCount,
                providerPaymentIntentId: paymentIntentId,
                occurredAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );

        // Promote user to surveyor (one-way, never reverted) + sync subscription
        await User.findByIdAndUpdate(userId, {
          role: 'surveyor',
          subscription: {
            plan: packageId,
            status: 'active',
            autoRenew: false,
            provider: 'stripe',
            providerCustomerId: session.customer || '',
            providerSubscriptionId: session.subscription || '',
            currentPeriodEnd: null,
          },
        });
      }

      res.json({
        success: true,
        credits: creditCount,
        packageId,
        amount: session.amount_total / 100,
      });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not verify session' });
  }
});

module.exports = router;
