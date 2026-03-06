const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Post = require('../models/Post');

/**
 * @route   GET /api/public/portfolio/:username
 * @desc    Get public profile and public posts for a user
 */
router.get('/portfolio/:username', async (req, res) => {
  try {
    // 1. Find the profile by username
    const profile = await Profile.findOne({ username: req.params.username });

    if (!profile || !profile.isPublic) {
      return res.status(404).json({ message: "Portfolio not found or private" });
    }

    // 2. Fetch all public posts for this user
    // We sort by isFeatured first, then by date
    const posts = await Post.find({ 
      user: profile.userId, 
      isPublic: true 
    }).sort({ isFeatured: -1, createdAt: -1 });

    // 3. Separate Featured and Regular for easy frontend rendering
    const featured = posts.filter(p => p.isFeatured);
    const regular = posts.filter(p => !p.isFeatured);

    res.json({
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        coverImageUrl: profile.coverImageUrl,
        socialLinks: profile.socialLinks,
        stats: profile.stats
      },
      featured,
      posts: regular
    });

  } catch (error) {
    console.error("Public Portfolio Error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
});


/**
 * @route   PATCH /api/public/portfolio/:username/view
 * @desc    Increment the view count for a public profile
 */
router.patch('/portfolio/:username/view', async (req, res) => {
  try {
    const { username } = req.params;

    // Find profile by username and increment the views field by 1
    const profile = await Profile.findOneAndUpdate(
      { username: username }, 
      { $inc: { "stats.views": 1 } }, // Using $inc ensures atomic updates
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ 
      success: true, 
      currentViews: profile.stats?.views || 0 
    });

  } catch (error) {
    console.error("Error updating views:", error);
    res.status(500).json({ message: "Error updating view count" });
  }
});

module.exports = router;