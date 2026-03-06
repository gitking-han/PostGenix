const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Basic identity
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
    firstName: String,
    lastName: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Creator / public info
    headline: {
      type: String, // e.g. "Helping founders grow on LinkedIn 🚀"
      maxLength: 120,
    },
    bio: {
      type: String, // About creator
      maxLength: 1000,
    },

    avatarUrl: String,
    coverImageUrl: String,

    // Social links (important for PostGenix)
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String,
    },

    // Creator stats (optional but powerful)
    stats: {
      followers: { type: Number, default: 0 },
      postsGenerated: { type: Number, default: 0 },
      views: {type: Number, default: 0}
    },

    // Location (optional)
    location: {
      city: String,
      country: String,
    },

    // Preferences (future use)
    preferences: {
      niche: {
        type: String, // e.g. SaaS, Web Dev, AI, Marketing
      },
      tone: {
        type: String, // professional | casual | storytelling
        default: 'professional',
      },
    },

    // Profile status
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Add this to your ProfileSchema
    featuredOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);
