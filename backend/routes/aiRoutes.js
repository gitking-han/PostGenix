const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const fetchuser = require('../middleware/fetchuser');
const ensurePro = require('../middleware/ensurePro');

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ── Existing routes (unchanged) ───────────────────────────────────────────────
router.post('/analyze-profile', fetchuser, upload.single('profileImage'), aiController.analyzeProfile);
router.post('/auto-draft', fetchuser, ensurePro, aiController.autoDraftToLinkedIn);

// ── Voice Fingerprint routes (NEW) ────────────────────────────────────────────

// GET  — returns cached fingerprint from User document (fast, no AI call)
// Called on Write page load to populate the Voice tab
router.get('/voice-fingerprint', fetchuser, ensurePro, aiController.getVoiceFingerprint);

// POST — runs the AI analysis and saves result to User document
// Called when user clicks "Generate Fingerprint" or "Regenerate Fingerprint"
router.post('/voice-fingerprint', fetchuser, ensurePro, aiController.generateVoiceFingerprint);

module.exports = router;