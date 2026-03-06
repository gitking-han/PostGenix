const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const settingsController = require('../controllers/settingsController');

// ROUTE 1: Get Settings using: GET "/api/settings/fetch". Login required
router.get('/fetch', fetchuser, settingsController.getSettings);

// ROUTE 2: Update Settings using: PUT "/api/settings/update". Login required
router.put('/update', fetchuser, settingsController.updateSettings);

module.exports = router;