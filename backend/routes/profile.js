const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const fetchuser = require("../middleware/fetchuser");

const Post = require("../models/Post"); // 1. Import the Post model

router.get("/me", fetchuser, async (req, res) => {
  try {
    // 2. Fetch both profile and post count in parallel for better performance
    const [profileDoc, postCount] = await Promise.all([
      Profile.findOne({ userId: req.user.id }),
      Post.countDocuments({ user: req.user.id }) // Count posts where user field matches
    ]);

    if (!profileDoc) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Convert mongoose document to plain object to modify it
    let profile = profileDoc.toObject();

    // 3. Inject the real-time count into the stats object
    if (!profile.stats) profile.stats = {};
    profile.stats.postsGenerated = postCount;

    // --- Profile Completion Logic (kept your existing logic) ---
    const requiredFields = [
      "firstName",
      "lastName",
      "headline",
      "bio",
      "coverImageUrl",
      "socialLinks.linkedin",
      "preferences.niche",
    ];

    let filled = 0;
    requiredFields.forEach((field) => {
      const keys = field.split(".");
      let value = profile;
      for (const key of keys) value = value?.[key];
      if (typeof value === "string" && value.trim()) filled++;
    });

    const completion = Math.floor((filled / requiredFields.length) * 100);

    // 4. Send the updated profile (with correct post count) and completion
    res.json({ profile, completion });

  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Complete / update profile
 */
router.put("/complete", fetchuser, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      avatarUrl,
      headline,
      bio,
      coverImageUrl,
      socialLinks = {},
      location = {},
      preferences = {},
    } = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        firstName: firstName || "",
        lastName: lastName || "",
        avatarUrl: avatarUrl || "",
        headline: headline || "",
        bio: bio || "",
        coverImageUrl: coverImageUrl || "",
        socialLinks,
        location,
        preferences: { ...preferences, tone: preferences.tone || "professional" },
        isPublic: true,
      });
    } else {
      // Update identity fields (The ones from Google/LinkedIn)
      if (firstName !== undefined) profile.firstName = firstName;
      if (lastName !== undefined) profile.lastName = lastName;
      if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

      // Update other fields
      if (headline !== undefined) profile.headline = headline;
      if (bio !== undefined) profile.bio = bio;
      if (coverImageUrl !== undefined) profile.coverImageUrl = coverImageUrl;

      profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
      profile.location = { ...profile.location, ...location };
      profile.preferences = { ...profile.preferences, ...preferences };

      await profile.save();
    }

    res.json({ success: true, profile });
    // Inside your Profile Save function:
await User.findByIdAndUpdate(req.user.id, {
    $set: { 'onboarding.hasCompletedProfile': true }
});
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;