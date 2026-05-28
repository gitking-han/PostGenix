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
  paddleCustomerId: {
    type: String,
    default: null
  },
  subscriptionId: {
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
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'unknown'],
    default: 'unknown'
  },

  linkedin: {
    accessToken: { type: String, default: null },
    personUrn: { type: String, default: null },
    profileName: { type: String, default: null },
    isConnected: { type: Boolean, default: false }
  },

  onboarding: {
    showProfileGuide: { type: Boolean, default: true },
    hasCompletedProfile: { type: Boolean, default: false }
  },

  // ── Voice Fingerprint (already existed) ────────────────────────────────────
  voiceFingerprint: {
    tone: [String],
    patterns: [String],
    strengths: [String],
    summary: { type: String, default: null },
    openingStyle: { type: String, default: null },
    postsAnalyzed: { type: Number, default: 0 },
    generatedAt: { type: Date, default: null },
  },

  // ── Brand Drift Cache (NEW) ────────────────────────────────────────────────
  // Stores the last AI drift analysis result so we don't call Claude on every
  // dashboard load. Refreshed automatically when cache is older than 24 hours.
  brandDriftCache: {
    driftDetected: { type: Boolean, default: false },
    driftTopic: { type: String, default: null },
    updatedAt: { type: Date, default: null },
  },

  // CREDIT FIELDS
  credits: { type: Number, default: 10 },
  lastCreditReset: { type: Date, default: Date.now },

  // PASSWORD RESET FIELDS
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;