const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment: Environment.sandbox, // ← change to Environment.production when going live
});

const detectBillingCycle = (payload) => {
  const interval = payload?.billing_cycle?.interval;
  if (interval === 'year') return 'yearly';
  if (interval === 'month') return 'monthly';

  const nextBilling = payload?.current_billing_period?.ends_at;
  if (nextBilling) {
    const days = (new Date(nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days > 45 ? 'yearly' : 'monthly';
  }

  return 'unknown';
};

router.post('/webhook', async (req, res) => {
  const signature = req.headers['paddle-signature'] || '';
  const secret    = process.env.PADDLE_WEBHOOK_SECRET || '';
  const rawBody   = req.rawBody;

  if (!rawBody) return res.status(400).send("No body");

  try {
    // 1. Verify the webhook signature (throws if invalid)
    paddle.webhooks.unmarshal(rawBody, secret, signature);

    const event     = JSON.parse(rawBody);
    const eventType = event.event_type;
    const data      = event.data;

    if (!data) return res.json({ success: true });

    const userId         = data.custom_data?.userId || data.customData?.userId;
    const subscriptionId = data.id;
    const status         = data.status;

    console.log(`📦 Paddle event: ${eventType} | status: ${status} | sub: ${subscriptionId}`);

    // ── 2. Subscription activated / created / updated ────────────────────────
    if (
      eventType === 'subscription.created'   ||
      eventType === 'subscription.activated' ||
      eventType === 'subscription.updated'
    ) {
      const isPro = status === 'active' || status === 'trialing';

      const detectBillingCycle = (payload) => {
        const interval = payload?.billing_cycle?.interval;
        if (interval === 'year') return 'yearly';
        if (interval === 'month') return 'monthly';

        // Fallback: if next billing is far in the future, assume yearly.
        const nextBilling = payload?.current_billing_period?.ends_at;
        if (nextBilling) {
          const days = (new Date(nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return days > 45 ? 'yearly' : 'monthly';
        }

        return 'unknown';
      };

      const updateData = {
        plan:               isPro ? 'pro' : 'free',
        subscriptionId:     subscriptionId,
        paddleCustomerId:   data.customer_id || data.customerId,
        subscriptionStatus: status,
        billingCycle:       detectBillingCycle(data),
        // Keep track of when the current billing period ends
        planEndsAt:         data.current_billing_period?.ends_at
                              ? new Date(data.current_billing_period.ends_at)
                              : null,
      };

      // Use userId from customData if available, otherwise fall back to subscriptionId lookup
      if (userId) {
        await User.findByIdAndUpdate(userId, updateData);
        console.log(`✅ Updated by userId: ${userId}`);
      } else {
        await User.findOneAndUpdate({ subscriptionId }, updateData);
        console.log(`✅ Updated by subscriptionId: ${subscriptionId}`);
      }
    }

    // ── 3. Subscription scheduled for cancellation (user cancelled, still active) ──
    // Paddle fires this when a user cancels but still has time left in the period.
    // We mark the status but KEEP planEndsAt so the user retains access until that date.
    if (eventType === 'subscription.canceled') {
      // ─── CRITICAL FIX ────────────────────────────────────────────────────────
      // OLD (wrong): planEndsAt: null  → user loses Pro instantly
      // NEW (correct): keep the billing period end date → user keeps Pro until then
      //
      // Paddle's canceled event includes `current_billing_period.ends_at` which
      // is the last day the user paid for. That's their access expiry.
      const accessEndsAt = data.current_billing_period?.ends_at
        ? new Date(data.current_billing_period.ends_at)
        : null;

      const updateFields = {
        subscriptionStatus: 'canceled',
        planEndsAt:         accessEndsAt, // ← keep this! don't set to null
      };

      const cycle = detectBillingCycle(data);
      if (cycle !== 'unknown') {
        updateFields.billingCycle = cycle;
      }

      await User.findOneAndUpdate(
        { subscriptionId },
        updateFields
      );
      console.log(`📉 Subscription canceled: ${subscriptionId} — access until ${accessEndsAt}`);
    }

    // ── 4. Past due (payment failed) ─────────────────────────────────────────
    if (eventType === 'subscription.past_due' || status === 'past_due') {
      await User.findOneAndUpdate(
        { subscriptionId },
        { subscriptionStatus: 'past_due' }
        // Don't downgrade yet — Paddle will retry. Downgrade only on 'canceled'.
      );
      console.log(`⚠️  Subscription past_due: ${subscriptionId}`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(400).send("Invalid Signature");
  }
});

module.exports = router;