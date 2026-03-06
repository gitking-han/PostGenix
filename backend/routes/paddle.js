const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');
;

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment: Environment.sandbox, 
});

router.post('/webhook', async (req, res) => {
  const signature = req.headers['paddle-signature'] || '';
  const secret = process.env.PADDLE_WEBHOOK_SECRET || '';
  const rawBody = req.rawBody;

  if (!rawBody) return res.status(400).send("No body");

  try {
    paddle.webhooks.unmarshal(rawBody, secret, signature);
    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const data = event.data;

    if (!data) return res.json({ success: true });

    const userId = data.custom_data?.userId || data.customData?.userId;
    const subscriptionId = data.id; 
    const status = data.status;

    // 1. Handle Activation / Updates
    if (eventType.includes('subscription.created') || 
        eventType.includes('subscription.activated') || 
        eventType.includes('subscription.updated')) {
      
      const updateData = {
        plan: (status === 'active' || status === 'trialing') ? 'pro' : 'free',
        subscriptionId: subscriptionId,
        paddleCustomerId: data.customer_id || data.customerId,
        subscriptionStatus: status,
        planEndsAt: data.current_billing_period?.ends_at || null 
      };

      if (userId) {
        await User.findByIdAndUpdate(userId, updateData);
      } else {
        await User.findOneAndUpdate({ subscriptionId }, updateData);
      }
      console.log(`✅ Subscription ${status}: ${subscriptionId}`);
    }

    // 2. Handle Cancellation
    // This event fires when the subscription is fully ended
    if (eventType === 'subscription.canceled') {
      await User.findOneAndUpdate(
        { subscriptionId: subscriptionId }, 
        { 
          plan: 'free', 
          subscriptionStatus: 'canceled',
          credits: 10,
          planEndsAt: null
          // Keep the paddleCustomerId in case they resubscribe later
        }
      );
      console.log(`📉 Subscription Canceled: ${subscriptionId}`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(400).send("Invalid Signature");
  }
});
module.exports = router;
