const User = require('../models/User');
const Post = require('../models/Post');
const Settings = require('../models/Settings');
const axios = require('axios');
const Anthropic = require("@anthropic-ai/sdk");

const anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/* ==========================================================
   LINKEDIN TOOL DEFINITION
   ========================================================== */
const linkedinTool = {
    name: "create_linkedin_post",
    description: "Formats and sends a post to the user's LinkedIn profile. Use this when the user wants to draft or publish a post.",
    input_schema: {
        type: "object",
        properties: {
            commentary: {
                type: "string",
                description: "The main text of the post. Should include the body and any relevant hashtags."
            }
        },
        required: ["commentary"]
    }
};

/* ==========================================================
   FEATURE 1: ANALYZE PROFILE (unchanged)
   ========================================================== */
exports.analyzeProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a screenshot of your profile." });
        }

        const user = await User.findById(req.user.id);

        const analysisPrompt = `
    Analyze this LinkedIn profile screenshot carefully. 
    Provide a professional audit including:
    1. HEADLINE: Is it SEO optimized?
    2. BRANDING: What does the visual style say about the person?
    3. SUGGESTIONS: Give 3 specific, actionable tips to increase engagement.
    4. CONTENT STRATEGY: Based on this profile, suggest 2 topics they should post about.
    
    STRICT FORMATTING RULES:
    - DO NOT use any Markdown symbols. 
    - Use plain text for section headers.
    - Use simple dashes (-) for bullet points.
    - Keep the tone professional and encouraging.
        
    IMPORTANT: At the very end of your response, provide a JSON block exactly like this:
    DATA:{"audience": "Target Audience Name", "tone": "Tone Name"}
`;

        const base64Image = req.file.buffer.toString('base64');
        const mediaType = req.file.mimetype;

        const response = await anthropicClient.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            temperature: 0.5,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,
                                data: base64Image,
                            }
                        },
                        {
                            type: "text",
                            text: analysisPrompt
                        }
                    ]
                }
            ]
        });

        const analysisResults = response.content[0].text;

        const jsonMatch = analysisResults.match(/DATA:({.*})/);
        let extractedAudience = "General";
        let extractedTone = "Professional";
        let cleanText = analysisResults;

        if (jsonMatch) {
            try {
                const parsedData = JSON.parse(jsonMatch[1]);
                extractedAudience = parsedData.audience;
                extractedTone = parsedData.tone;
                cleanText = analysisResults.replace(/DATA:({.*})/, "").trim();
            } catch (e) {
                console.error("Failed to parse Claude JSON data", e);
            }
        }

        await Settings.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    lastProfileAnalysis: {
                        text: cleanText,
                        audience: extractedAudience,
                        tone: extractedTone,
                        analyzedAt: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );

        if (user.plan === 'free') {
            user.credits -= 1;
            await user.save();
        }

        res.status(200).json({
            analysis: cleanText,
            extractedData: {
                audience: extractedAudience,
                tone: extractedTone
            },
            remainingCredits: user.credits
        });

    } catch (error) {
        console.error("Profile Analysis Error:", error);
        res.status(500).json({ message: "Analysis failed", error: error.message });
    }
};

/* ==========================================================
   FEATURE 2: AUTO-DRAFT TO LINKEDIN (FIXED)

   Changes from original:
   - Now accepts `postId` in request body
   - Saves linkedinPostId, linkedinUrl, publishedAt to Post document
   - Returns postId back to frontend so it can track the post
   ========================================================== */
exports.autoDraftToLinkedIn = async (req, res) => {
    try {
        const { postContent, postId } = req.body; // ← postId added

        const user = await User.findById(req.user.id);

        if (!user.linkedin || !user.linkedin.isConnected) {
            return res.status(400).json({
                message: "LinkedIn not connected.",
                action: "Please connect your LinkedIn account in settings."
            });
        }

        const response = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            tools: [linkedinTool],
            messages: [{
                role: "user",
                content: `I want to post this content to my LinkedIn. Please format it properly and use the tool to draft it: ${postContent}`
            }]
        });

        const stopReason = response.stop_reason;

        if (stopReason === "tool_use") {
            const toolCall = response.content.find(c => c.type === "tool_use");
            const { commentary } = toolCall.input;

            // ── Publish to LinkedIn ────────────────────────────────────────────
            const linkedinRes = await axios.post('https://api.linkedin.com/v2/posts', {
                author: user.linkedin.personUrn,
                commentary: commentary,
                visibility: "PUBLIC",
                distribution: {
                    feedDistribution: "MAIN_FEED",
                    targetEntities: []
                },
                lifecycleState: "PUBLISHED"
            }, {
                headers: {
                    'Authorization': `Bearer ${user.linkedin.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/json'
                }
            });

            // ── Capture LinkedIn post ID ───────────────────────────────────────
            const linkedinId = linkedinRes.data.id
                || linkedinRes.headers['x-restli-id']
                || linkedinRes.headers['x-linkedin-id']
                || null;

            const linkedinUrl = linkedinId
                ? `https://www.linkedin.com/feed/update/${linkedinId}/`
                : "";

            console.log("LOG: Captured LinkedIn ID:", linkedinId);

            // ── Save to Post document (NEW) ────────────────────────────────────
            // Only update if postId was passed and exists in DB
            if (postId) {
                try {
                    await Post.findOneAndUpdate(
                        { _id: postId, user: req.user.id }, // user check = security
                        {
                            $set: {
                                linkedinPostId: linkedinId,
                                linkedinUrl:    linkedinUrl,
                                publishedAt:    new Date(),
                            }
                        }
                    );
                    console.log("LOG: Saved linkedinPostId to Post:", postId);
                } catch (dbErr) {
                    // Don't fail the whole request if DB save fails
                    console.error("LOG: Failed to save linkedinPostId to Post:", dbErr.message);
                }
            } else {
                console.warn("LOG: No postId sent — linkedinPostId not saved to DB.");
            }

            return res.status(200).json({
                message: "Post successfully dispatched!",
                linkedinUrl,
                linkedinPostId: linkedinId, // ← also return it to frontend
                postId,                     // ← echo back so frontend can update state
            });

        } else {
            return res.status(500).json({ message: "Agent decided not to use the tool. Try again." });
        }

    } catch (error) {
        console.error("LinkedIn Agent Error:", error.response?.data || error.message);
        res.status(500).json({
            message: "Failed to post to LinkedIn",
            error: error.response?.data?.message || error.message
        });
    }
};