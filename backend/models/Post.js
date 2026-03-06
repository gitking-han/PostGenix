const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // ADD THIS LINE: Links the post to a specific user
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', // This must match the name of your User model
    required: true 
  },
  prompt: { type: String, required: true },
  content: { type: String, required: true },
  postType: { type: String, default: "Long" },
  tone: { type: String, default: "Professional" },
  isSaved: { type: Boolean, default: false },
  // Add these two fields to your existing schema
  isPublic: { type: Boolean, default: false }, // Only public posts show on portfolio
  isFeatured: { type: Boolean, default: false }, // Highlighted posts at the top
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);