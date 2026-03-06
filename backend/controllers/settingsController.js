const Settings = require('../models/Settings');

// Get user settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.id });
        if (!settings) {
            settings = await Settings.create({ user: req.user.id });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
};

// Update user settings
exports.updateSettings = async (req, res) => {
    try {
        const { type, data } = req.body; // type: 'brandKit' | 'modelConfig' | 'integrations'

        let updateQuery = {};
        updateQuery[type] = data;

        const settings = await Settings.findOneAndUpdate(
            { user: req.user.id },
            { $set: updateQuery },
            { new: true, upsert: true }
        );

        res.json(settings);
        // Inside your settings update function
        // if (req.body.type === 'brandKit') {
        //     await User.findByIdAndUpdate(req.user.id, {
        //         $set: { 'onboarding.hasSetBrandKit': true }
        //     });
        // }
    } catch (error) {
        res.status(500).send("Error updating settings");
    }
};