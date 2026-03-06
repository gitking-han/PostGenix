const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },

  // PADDLE & SUBSCRIPTION FIELDS
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  paddleCustomerId: { // Paddle's unique customer ID
    type: String,
    default: null
  },
  subscriptionId: { // The specific subscription ID
    type: String,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'deleted', 'trialing', null],
    default: null
  },
  planEndsAt: {
    type: Date,
    default: null
  },
  linkedin: {
    accessToken: { type: String, default: null },
    personUrn: { type: String, default: null }, // Critical for API calls
    profileName: { type: String, default: null },
    
    isConnected: { type: Boolean, default: false }
},

onboarding: {
    showProfileGuide: { type: Boolean, default: true }, // Should the spotlight post appear?
    hasCompletedProfile: { type: Boolean, default: false } // Did they finish the task?
},
  // CREDIT FIELDS
  credits: { type: Number, default: 10 },
  lastCreditReset: { type: Date, default: Date.now }
});

const User = mongoose.model("user", UserSchema);
module.exports = User;