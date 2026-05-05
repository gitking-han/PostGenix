const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  // ── sparse: true is REQUIRED here ──────────────────────────────────────────
  // Without it, unique: true rejects any second post where messageId is null,
  // because MongoDB treats multiple null values as duplicates of the same key.
  // sparse: true tells MongoDB to only enforce uniqueness on documents where
  // the field actually exists and is not null — safe for optional fields.
  messageId: { type: String, unique: true, sparse: true, default: null },

  prompt:   { type: String, required: true },
  content:  { type: String, required: true },
  postType: { type: String, default: "Long" },
  tone:     { type: String, default: "Professional" },
  isSaved:  { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  // ── LinkedIn publishing fields ────────────────────────────────────────────
  linkedinPostId: { type: String, default: null },
  linkedinUrl:    { type: String, default: null },
  publishedAt:    { type: Date,   default: null },

  // ── Engagement data (fetched from LinkedIn API, cached here) ─────────────
  engagement: {
    likes:       { type: Number, default: 0 },
    comments:    { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    fetchedAt:   { type: Date,   default: null },
  },

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);