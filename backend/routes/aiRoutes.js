const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const fetchuser = require('../middleware/fetchuser');

// Setup multer for memory storage (we don't need to save the file, just use the buffer)
const upload = multer({ storage: multer.memoryStorage() });

// New Route: Analyze Profile Screenshot
router.post('/analyze-profile', fetchuser, upload.single('profileImage'), aiController.analyzeProfile);
router.post('/auto-draft', fetchuser, aiController.autoDraftToLinkedIn)

module.exports = router;