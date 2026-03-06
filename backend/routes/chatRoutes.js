const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const fetchuser = require('../middleware/fetchuser');

// 1. Get all conversations for the sidebar
router.get('/history', fetchuser, async (req, res) => {
  try {
    const chats = await Conversation.find({ user: req.user.id })
      .select('title lastPreview updatedAt') // Only send what sidebar needs
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

// 2. Get a specific conversation when clicked in sidebar
router.get('/:id', fetchuser, async (req, res) => {
  try {
    const chat = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat" });
  }
});

// 3. Create or Update a conversation after AI generates a response
router.post('/save-interaction', fetchuser, async (req, res) => {
  try {
    const { chatId, userPrompt, aiResponse, postType, tone } = req.body;

    let chat;
    if (chatId) {
      // Update existing thread
      chat = await Conversation.findOneAndUpdate(
        { _id: chatId, user: req.user.id },
        { 
          $push: { 
            messages: [
              { role: 'user', content: userPrompt },
              { role: 'assistant', content: aiResponse }
            ] 
          },
          $set: { lastPreview: aiResponse.substring(0, 60) + "..." }
        },
        { new: true }
      );
    } else {
      // Create new thread
      chat = await Conversation.create({
        user: req.user.id,
        title: userPrompt.substring(0, 30) + (userPrompt.length > 30 ? "..." : ""),
        lastPreview: aiResponse.substring(0, 60) + "...",
        postType,
        tone,
        messages: [
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: aiResponse }
        ]
      });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error saving chat" });
  }
});

// 4. Delete a chat
router.delete('/:id', fetchuser, async (req, res) => {
    try {
      await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting" });
    }
});
router.get('/test', (req, res) => {
    res.json({ message: "Chat routes are working!" });
});
module.exports = router;