const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: true 
  },
  prompt:   { type: String, required: true },
  content:  { type: String, required: true },
  postType: { type: String, default: "Long" },
  tone:     { type: String, default: "Professional" },
  isSaved:  { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  // ── LinkedIn publishing fields ──────────────────────────────────────────────
  // Stored when the post is published via PostGenix → LinkedIn
  linkedinPostId: { type: String, default: null },
  linkedinUrl:    { type: String, default: null },
  publishedAt:    { type: Date,   default: null },

  // ── Engagement data (fetched from LinkedIn API, cached here) ────────────────
  engagement: {
    likes:       { type: Number, default: 0 },
    comments:    { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    fetchedAt:   { type: Date,   default: null }, // last time we pulled from LinkedIn
  },

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);