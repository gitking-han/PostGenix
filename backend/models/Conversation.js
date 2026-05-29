const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: "New Generation"
  },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },

      
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
      },

      lastLinkedinUrl: {
        type: String,
        default: null
      },

      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastPreview: String,
  postType: String,
  tone: String,
}, { timestamps: true });