const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Post = require("../models/Post");
const Profile = require("../models/Profile");
const User = require("../models/User");
const ensurePro = require("../middleware/ensurePro");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * All post styles available in PostGenix.
 * Keep in sync with your Write page pill options.
 */
const ALL_STYLES = ["Short", "Story", "List", "Hot Take", "Career"];

/**
 * Count how many posts were created in the last N days.
 */
function postsInLastDays(posts, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return posts.filter((p) => new Date(p.createdAt) >= cutoff).length;
}

/**
 * Simple keyword-match score: what % of posts contain at least one
 * niche keyword in either the prompt or content.
 * Returns 0–100.
 */
function nicheConsistencyScore(posts, niche) {
  if (!niche || posts.length === 0) return 0;

  // Split niche string into individual keywords (min 3 chars)
  const keywords = niche
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length >= 3);

  if (keywords.length === 0) return 0;

  const matched = posts.filter((p) => {
    const text = `${p.prompt} ${p.content}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });

  return Math.round((matched.length / posts.length) * 100);
}

/**
 * Voice consistency: % of posts whose tone matches the profile tone preference.
 * Returns 0–100.
 */
function voiceConsistencyScore(posts, preferredTone) {
  if (!preferredTone || posts.length === 0) return 0;
  const tone = preferredTone.toLowerCase();
  const matched = posts.filter(
    (p) => (p.tone || "").toLowerCase() === tone
  );
  return Math.round((matched.length / posts.length) * 100);
}

/**
 * Posting frequency score based on last 30 days.
 * Target = 12 posts / 30 days (~3/week). Returns 0–100 (capped).
 */
function postingFrequencyScore(posts) {
  const TARGET = 12; // posts per 30 days
  const recent = postsInLastDays(posts, 30);
  return Math.min(100, Math.round((recent / TARGET) * 100));
}

/**
 * Content variety: how many distinct postTypes the user has used
 * out of all available styles. Returns 0–100.
 */
function contentVarietyScore(posts) {
  if (posts.length === 0) return 0;
  const used = new Set(posts.map((p) => p.postType).filter(Boolean));
  return Math.round((used.size / ALL_STYLES.length) * 100);
}

/**
 * Weighted Brand Score (0–100):
 *   Niche consistency  30%
 *   Voice consistency  25%
 *   Posting frequency  25%
 *   Content variety    20%
 */
function calcBrandScore(niche, voice, frequency, variety) {
  return Math.round(
    niche * 0.3 + voice * 0.25 + frequency * 0.25 + variety * 0.2
  );
}

// ─── Route 1: Brand Score ─────────────────────────────────────────────────────
/**
 * @route   GET /api/analytics/brand-score
 * @desc    Returns overall brand score + weekly change
 * @access  Private
 */
router.get("/brand-score", fetchuser, ensurePro, async (req, res) => {
  try {
    const [posts, profileDoc] = await Promise.all([
      Post.find({ user: req.user.id }),
      Profile.findOne({ userId: req.user.id }),
    ]);

    const niche = profileDoc?.preferences?.niche || "";
    const tone = profileDoc?.preferences?.tone || "";

    const nicheScore = nicheConsistencyScore(posts, niche);
    const voiceScore = voiceConsistencyScore(posts, tone);
    const freqScore = postingFrequencyScore(posts);
    const varScore = contentVarietyScore(posts);

    const currentScore = calcBrandScore(nicheScore, voiceScore, freqScore, varScore);

    // Weekly change: compare score using posts from before last 7 days
    const cutoff7 = new Date();
    cutoff7.setDate(cutoff7.getDate() - 7);
    const olderPosts = posts.filter((p) => new Date(p.createdAt) < cutoff7);

    let weeklyChange = 0;
    if (olderPosts.length > 0) {
      const oldNiche = nicheConsistencyScore(olderPosts, niche);
      const oldVoice = voiceConsistencyScore(olderPosts, tone);
      const oldFreq = postingFrequencyScore(olderPosts);
      const oldVar = contentVarietyScore(olderPosts);
      const oldScore = calcBrandScore(oldNiche, oldVoice, oldFreq, oldVar);
      weeklyChange = currentScore - oldScore;
    }

    res.json({
      score: currentScore,
      weeklyChange,
      breakdown: {
        nicheConsistency: nicheScore,
        voiceConsistency: voiceScore,
        postingFrequency: freqScore,
        contentVariety: varScore,
      },
    });
  } catch (err) {
    console.error("brand-score error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 2: Brand Intelligence Bars ────────────────────────────────────────
/**
 * @route   GET /api/analytics/brand-intelligence
 * @desc    Returns the 4 brand intelligence bar values
 * @access  Private
 */
router.get("/brand-intelligence", fetchuser, ensurePro, async (req, res) => {
  try {
    const [posts, profileDoc] = await Promise.all([
      Post.find({ user: req.user.id }),
      Profile.findOne({ userId: req.user.id }),
    ]);

    const niche = profileDoc?.preferences?.niche || "";
    const tone = profileDoc?.preferences?.tone || "";

    res.json({
      nicheConsistency: nicheConsistencyScore(posts, niche),
      voiceConsistency: voiceConsistencyScore(posts, tone),
      postingFrequency: postingFrequencyScore(posts),
      contentVariety: contentVarietyScore(posts),
    });
  } catch (err) {
    console.error("brand-intelligence error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 3: Brand Drift ─────────────────────────────────────────────────────
/**
 * @route   GET /api/analytics/brand-drift
 * @desc    Uses AI to detect if last 3 posts are off-niche.
 *          Result is cached on the User document for 24h to avoid
 *          hammering the AI API on every dashboard load.
 * @access  Private
 */
router.get("/brand-drift", fetchuser, ensurePro, async (req, res) => {
  try {
    const [user, profileDoc, recentPosts] = await Promise.all([
      User.findById(req.user.id),
      Profile.findOne({ userId: req.user.id }),
      Post.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(3),
    ]);

    const niche = profileDoc?.preferences?.niche || "";

    // If no niche set or fewer than 3 posts, skip AI call
    if (!niche || recentPosts.length < 3) {
      return res.json({
        driftDetected: false,
        driftTopic: null,
        userNiche: niche || null,
        reason: recentPosts.length < 3 ? "not_enough_posts" : "no_niche_set",
      });
    }

    // ── Cache check: only re-run AI if cache is older than 24h ──────────────
    const cache = user.brandDriftCache;
    const cacheAge = cache?.updatedAt
      ? (Date.now() - new Date(cache.updatedAt).getTime()) / 1000 / 60 / 60
      : 999;

    if (cache && cacheAge < 24) {
      return res.json({
        driftDetected: cache.driftDetected,
        driftTopic: cache.driftTopic,
        userNiche: niche,
        fromCache: true,
      });
    }

    // ── AI drift detection ───────────────────────────────────────────────────
    const postSummaries = recentPosts
      .map((p, i) => `Post ${i + 1}: "${p.prompt}"`)
      .join("\n");

    const prompt = `You are a LinkedIn brand analyst.

A user's defined niche is: "${niche}"

Their last 3 LinkedIn posts are:
${postSummaries}

Analyze whether these posts are on-niche or off-niche.
Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "driftDetected": true or false,
  "driftTopic": "brief description of what the posts are actually about (only if drift detected, otherwise null)"
}`;

    const aiRes = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = aiRes.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    // ── Save to cache on User document ──────────────────────────────────────
    // NOTE: Add brandDriftCache field to your User model (see comment at bottom)
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "brandDriftCache.driftDetected": parsed.driftDetected,
        "brandDriftCache.driftTopic": parsed.driftTopic,
        "brandDriftCache.updatedAt": new Date(),
      },
    });

    res.json({
      driftDetected: parsed.driftDetected,
      driftTopic: parsed.driftTopic,
      userNiche: niche,
      fromCache: false,
    });
  } catch (err) {
    console.error("brand-drift error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 4: What's Working Insights ────────────────────────────────────────
/**
 * @route   GET /api/analytics/insights
 * @desc    Derives insights from post metadata (no engagement data needed).
 *          Uses post type distribution, posting time patterns, and style gaps.
 * @access  Private
 */
router.get("/insights", fetchuser, ensurePro, async (req, res) => {
  try {
    const [posts, profileDoc] = await Promise.all([
      Post.find({ user: req.user.id }).sort({ createdAt: -1 }),
      Profile.findOne({ userId: req.user.id }),
    ]);

    if (posts.length === 0) {
      return res.json({
        insights: [
          {
            type: "info",
            text: "No posts yet — write your first post to start seeing insights",
            sub: "Insights are generated from your posting patterns",
          },
        ],
      });
    }

    const insights = [];

    // ── Insight 1: Most used post type ───────────────────────────────────────
    const typeCounts = {};
    posts.forEach((p) => {
      const t = p.postType || "Long";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    if (topType) {
      const pct = Math.round((topType[1] / posts.length) * 100);
      insights.push({
        type: "success",
        text: `${pct}% of your posts are "${topType[0]}" format — your most used style`,
        sub: `${topType[1]} out of ${posts.length} total posts`,
      });
    }

    // ── Insight 2: Best posting day ──────────────────────────────────────────
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = {};
    posts.forEach((p) => {
      const day = new Date(p.createdAt).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (bestDay) {
      insights.push({
        type: "warning",
        text: `You write most on ${dayNames[bestDay[0]]}s — ${bestDay[1]} post${bestDay[1] > 1 ? "s" : ""} created that day`,
        sub: "Consistency on your best day builds audience habit",
      });
    }

    // ── Insight 3: Content gap — unused styles ───────────────────────────────
    const usedStyles = new Set(posts.map((p) => p.postType).filter(Boolean));
    const unusedStyles = ALL_STYLES.filter((s) => !usedStyles.has(s));
    if (unusedStyles.length > 0) {
      insights.push({
        type: "info",
        text: `You haven't tried "${unusedStyles[0]}" posts yet — a format popular in most niches`,
        sub: "Content variety improves reach and audience retention",
      });
    }

    // ── Insight 4: Posting streak / gap ─────────────────────────────────────
    const last7 = postsInLastDays(posts, 7);
    const last14 = postsInLastDays(posts, 14);
    const prev7 = last14 - last7;

    if (last7 > prev7 && last7 > 0) {
      insights.push({
        type: "success",
        text: `You posted ${last7} time${last7 > 1 ? "s" : ""} this week — up from ${prev7} last week`,
        sub: "Your posting momentum is growing",
      });
    } else if (last7 === 0 && posts.length > 0) {
      insights.push({
        type: "warning",
        text: "No posts in the last 7 days — your audience engagement may be dropping",
        sub: "LinkedIn rewards consistent creators",
      });
    }

    // ── Insight 5: Niche not set warning ─────────────────────────────────────
    const niche = profileDoc?.preferences?.niche;
    if (!niche) {
      insights.push({
        type: "info",
        text: "Set your niche in Profile to unlock Brand Drift detection and smarter insights",
        sub: "Settings → Profile → Niche",
      });
    }

    res.json({ insights: insights.slice(0, 3) }); // Cap at 3 for dashboard
  } catch (err) {
    console.error("insights error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 5: Engagement (LinkedIn API) ──────────────────────────────────────
/**
 * @route   GET /api/analytics/engagement
 * @desc    Fetches likes + comments from LinkedIn for all published posts.
 *          Results are cached on each Post document for 1 hour.
 *          Returns avgEngagement % and per-post breakdown.
 * @access  Private
 *
 * DEPENDS ON:
 *   - Post.linkedinPostId being set (saved by autoDraftToLinkedIn controller)
 *   - User.linkedin.accessToken being valid
 */
router.get("/engagement", fetchuser, ensurePro, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Must have LinkedIn connected
    if (!user?.linkedin?.isConnected || !user?.linkedin?.accessToken) {
      return res.json({
        avgEngagement: 0,
        nicheAvg: 2.8, // industry benchmark — update this as you gather real data
        postsTracked: 0,
        breakdown: [],
        reason: "linkedin_not_connected",
      });
    }

    // Only fetch posts that were published to LinkedIn
    const publishedPosts = await Post.find({
      user: req.user.id,
      linkedinPostId: { $ne: null },
    });

    if (publishedPosts.length === 0) {
      return res.json({
        avgEngagement: 0,
        nicheAvg: 2.8,
        postsTracked: 0,
        breakdown: [],
        reason: "no_published_posts",
      });
    }

    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    const breakdown = [];

    // Loop through each published post and fetch engagement if cache is stale
    for (const post of publishedPosts) {
      const cacheAge = post.engagement?.fetchedAt
        ? now - new Date(post.engagement.fetchedAt).getTime()
        : Infinity;

      let likes = post.engagement?.likes || 0;
      let comments = post.engagement?.comments || 0;
      let impressions = post.engagement?.impressions || 0;

      // ── Only re-fetch if cache is older than 1 hour ──────────────────────
      if (cacheAge > ONE_HOUR) {
        try {
          // LinkedIn Social Actions API — returns likes + comments
          const encoded = encodeURIComponent(post.linkedinPostId);
          const [likesRes, commentsRes] = await Promise.allSettled([
            fetch(
              `https://api.linkedin.com/v2/socialActions/${encoded}/likes?count=0`,
              {
                headers: {
                  Authorization: `Bearer ${user.linkedin.accessToken}`,
                  "X-Restli-Protocol-Version": "2.0.0",
                },
              }
            ),
            fetch(
              `https://api.linkedin.com/v2/socialActions/${encoded}/comments?count=0`,
              {
                headers: {
                  Authorization: `Bearer ${user.linkedin.accessToken}`,
                  "X-Restli-Protocol-Version": "2.0.0",
                },
              }
            ),
          ]);

          if (likesRes.status === "fulfilled" && likesRes.value.ok) {
            const likesData = await likesRes.value.json();
            likes = likesData.paging?.total || 0;
          }

          if (commentsRes.status === "fulfilled" && commentsRes.value.ok) {
            const commentsData = await commentsRes.value.json();
            comments = commentsData.paging?.total || 0;
          }

          // NOTE: LinkedIn impressions require Marketing Developer Platform access.
          // For now impressions stays 0 unless you have that access level.
          // When available: use /v2/organizationalEntityShareStatistics

          // ── Save back to Post document ──────────────────────────────────
          await Post.findByIdAndUpdate(post._id, {
            $set: {
              "engagement.likes":      likes,
              "engagement.comments":   comments,
              "engagement.impressions": impressions,
              "engagement.fetchedAt":  new Date(),
            },
          });

        } catch (liErr) {
          console.error(`Engagement fetch failed for post ${post._id}:`, liErr.message);
          // Use cached values if API call fails — don't break the whole response
        }
      }

      // ── Calculate engagement rate ─────────────────────────────────────────
      // Formula: (likes + comments) / max(impressions, 1) * 100
      // If impressions = 0 (no Marketing API), use a follower estimate of 500
      // as a temporary denominator. Replace 500 with real follower count later.
      const denominator = impressions > 0 ? impressions : 500;
      const engagementRate = parseFloat(
        (((likes + comments) / denominator) * 100).toFixed(1)
      );

      breakdown.push({
        postId:         post._id,
        prompt:         post.prompt,
        postType:       post.postType,
        publishedAt:    post.publishedAt,
        linkedinUrl:    post.linkedinUrl,
        likes,
        comments,
        impressions,
        engagementRate,
      });
    }

    // ── Aggregate average ─────────────────────────────────────────────────────
    const avgEngagement =
      breakdown.length > 0
        ? parseFloat(
            (
              breakdown.reduce((sum, p) => sum + p.engagementRate, 0) /
              breakdown.length
            ).toFixed(1)
          )
        : 0;

    res.json({
      avgEngagement,
      nicheAvg: 2.8, // static benchmark for now
      postsTracked: breakdown.length,
      breakdown,
    });

  } catch (err) {
    console.error("engagement error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ─── Route 6: Weekly Performance ────────────────────────────────────────────
/**
 * @route   GET /api/analytics/weekly-performance
 * @desc    Returns last 8 weeks of posting activity + avg engagement per week.
 *          Used for the line chart on the Analytics page.
 * @access  Private
 */
router.get("/weekly-performance", fetchuser, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Build 8-week buckets going backwards from today
    const weeks = [];
    const now   = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const weekPosts = posts.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= weekStart && d <= weekEnd;
      });

      // Engagement rate per post (published only)
      const engagements = weekPosts
        .filter((p) => p.linkedinPostId)
        .map((p) => {
          const likes      = p.engagement?.likes      ?? 0;
          const comments   = p.engagement?.comments   ?? 0;
          const impressions = p.engagement?.impressions ?? 0;
          const denom      = impressions > 0 ? impressions : 500;
          return ((likes + comments) / denom) * 100;
        });

      const avgEng =
        engagements.length > 0
          ? parseFloat(
              (engagements.reduce((a, b) => a + b, 0) / engagements.length).toFixed(1)
            )
          : 0;

      weeks.push({
        week:           weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        posts:          weekPosts.length,
        published:      weekPosts.filter((p) => p.linkedinPostId).length,
        avgEngagement:  avgEng,
      });
    }

    res.json({ weeks });
  } catch (err) {
    console.error("weekly-performance error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 7: Post Type Performance ─────────────────────────────────────────
/**
 * @route   GET /api/analytics/post-type-performance
 * @desc    Returns breakdown by post type: count, published count, avg engagement.
 *          Used for the bar chart on the Analytics page.
 * @access  Private
 */
router.get("/post-type-performance", fetchuser, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });

    const ALL_TYPES  = ["Short", "Story", "List", "Hot Take", "Career"];
    const breakdown  = [];

    for (const type of ALL_TYPES) {
      const typePosts    = posts.filter((p) => p.postType === type);
      const publishedOnes = typePosts.filter((p) => p.linkedinPostId);

      const engagements = publishedOnes.map((p) => {
        const likes       = p.engagement?.likes       ?? 0;
        const comments    = p.engagement?.comments    ?? 0;
        const impressions = p.engagement?.impressions ?? 0;
        const denom       = impressions > 0 ? impressions : 500;
        return ((likes + comments) / denom) * 100;
      });

      const avgEng =
        engagements.length > 0
          ? parseFloat(
              (engagements.reduce((a, b) => a + b, 0) / engagements.length).toFixed(1)
            )
          : 0;

      breakdown.push({
        postType:       type,
        count:          typePosts.length,
        publishedCount: publishedOnes.length,
        avgEngagement:  avgEng,
        // Percentage of total posts
        percentage:
          posts.length > 0
            ? Math.round((typePosts.length / posts.length) * 100)
            : 0,
      });
    }

    // Sort by count descending
    breakdown.sort((a, b) => b.count - a.count);

    res.json({ breakdown, totalPosts: posts.length });
  } catch (err) {
    console.error("post-type-performance error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ─── Route 8: Content Gaps ───────────────────────────────────────────────────
/**
 * @route   GET /api/analytics/content-gaps
 * @desc    Uses AI to identify topics the user hasn't covered in their niche.
 *          Cached on User document for 48h (contentGapsCache field).
 * @access  Private
 *
 * REQUIRES: Add contentGapsCache to User model:
 *   contentGapsCache: {
 *     gaps:      [{ topic: String, reason: String, difficulty: String }],
 *     updatedAt: { type: Date, default: null },
 *   }
 */
router.get("/content-gaps", fetchuser, async (req, res) => {
  try {
    const [user, profileDoc, recentPosts] = await Promise.all([
      User.findById(req.user.id),
      Profile.findOne({ userId: req.user.id }),
      Post.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(30),
    ]);

    const niche = profileDoc?.preferences?.niche || "";

    // If no niche set, return prompt to set it
    if (!niche) {
      return res.json({
        gaps: [],
        reason: "no_niche_set",
        message: "Set your niche in Profile to unlock Content Gap analysis.",
      });
    }

    // ── Cache check: 48-hour cache ────────────────────────────────────────
    const cache    = user.contentGapsCache;
    const cacheAge = cache?.updatedAt
      ? (Date.now() - new Date(cache.updatedAt).getTime()) / 1000 / 60 / 60
      : 999;

    if (cache?.gaps?.length > 0 && cacheAge < 48) {
      return res.json({ gaps: cache.gaps, fromCache: true });
    }

    // ── Build post topics list ────────────────────────────────────────────
    const topicsList = recentPosts
      .map((p, i) => `${i + 1}. "${p.prompt}"`)
      .join("\n");

    // ── AI prompt ─────────────────────────────────────────────────────────
    const prompt = `You are a LinkedIn content strategist.

A creator's niche is: "${niche}"

Here are the topics they have already written about (last 30 posts):
${topicsList || "No posts yet."}

Based on their niche, identify 5 high-value content topics they have NOT covered yet.
These should be topics that perform well in their niche and would resonate with their audience.

Respond ONLY with valid JSON — no markdown, no explanation:
[
  {
    "topic": "Short topic title (5-8 words)",
    "reason": "One sentence explaining why this topic would perform well for their niche",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]`;

    const aiRes = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages:   [{ role: "user", content: prompt }],
    });

    const rawText = aiRes.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let gaps;
    try {
      gaps = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      return res.status(500).json({ message: "Failed to parse content gaps. Try again." });
    }

    // ── Cache result ──────────────────────────────────────────────────────
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "contentGapsCache.gaps":      gaps,
        "contentGapsCache.updatedAt": new Date(),
      },
    });

    res.json({ gaps, fromCache: false });
  } catch (err) {
    console.error("content-gaps error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;

