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
   FEATURE 2: AUTO-DRAFT TO LINKEDIN (unchanged)
   ========================================================== */
exports.autoDraftToLinkedIn = async (req, res) => {
    try {
        const { postContent, postId } = req.body;

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

            const linkedinId = linkedinRes.data.id
                || linkedinRes.headers['x-restli-id']
                || linkedinRes.headers['x-linkedin-id']
                || null;

            const linkedinUrl = linkedinId
                ? `https://www.linkedin.com/feed/update/${linkedinId}/`
                : "";

            console.log("LOG: Captured LinkedIn ID:", linkedinId);

            if (postId) {
                try {
                    await Post.findOneAndUpdate(
                        { _id: postId, user: req.user.id },
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
                    console.error("LOG: Failed to save linkedinPostId to Post:", dbErr.message);
                }
            } else {
                console.warn("LOG: No postId sent — linkedinPostId not saved to DB.");
            }

            return res.status(200).json({
                message: "Post successfully dispatched!",
                linkedinUrl,
                linkedinPostId: linkedinId,
                postId,
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

/* ==========================================================
   FEATURE 3: GENERATE VOICE FINGERPRINT

   REDESIGNED: Accepts user-pasted writing samples from the
   request body instead of reading AI-generated posts from DB.

   Why: Posts stored in the DB were generated by PostGenix AI
   in its own voice. Analyzing them produced a fingerprint of
   PostGenix's default style — not the user's actual voice.
   This made Voice Mode circular and meaningless.

   New flow:
   - Frontend sends `samples` (raw text the user pasted)
   - Backend splits into individual samples, validates count
   - Claude analyzes the human-written samples
   - Result saved to User document as before

   Minimum: MIN_CHARS characters of pasted content (not post count).
   ========================================================== */
exports.generateVoiceFingerprint = async (req, res) => {
    try {
        const { samples } = req.body;

        // ── Validate input ────────────────────────────────────────────────────
        // We check character length rather than post count because users paste
        // raw text — counting posts reliably from free-form text isn't worth the
        // complexity. 200 chars (~2–3 sentences) is enough for a meaningful signal.
        const MIN_CHARS = 200;

        if (!samples || typeof samples !== "string" || samples.trim().length < MIN_CHARS) {
            return res.status(400).json({
                message: `Please paste more of your own writing. We need at least a few sentences to map your voice accurately.`,
                charsProvided: samples?.trim().length || 0,
                minRequired: MIN_CHARS,
            });
        }

        const trimmedSamples = samples.trim();

        // ── Split into individual samples for the prompt ──────────────────────
        // Users are asked to separate posts with a blank line.
        // We count segments to report back how many pieces were analyzed.
        const segments = trimmedSamples
            .split(/\n\s*\n/)           // split on blank lines
            .map(s => s.trim())
            .filter(s => s.length > 20); // drop tiny fragments

        const samplesAnalyzed = segments.length;

        // ── Claude prompt ─────────────────────────────────────────────────────
        const fingerprintPrompt = `You are a professional writing analyst and LinkedIn brand strategist.

Analyze the following writing samples. These were written by a real person — not AI. Extract their unique voice, tone, and style patterns precisely.

--- WRITING SAMPLES START ---
${trimmedSamples}
--- WRITING SAMPLES END ---

Based on these samples, respond ONLY with a valid JSON object — no markdown, no code blocks, no explanation outside the JSON:
{
  "tone": ["array of 3-5 single-word or short tone descriptors that describe THIS person's voice"],
  "patterns": ["array of 2-4 specific writing patterns you observed in their actual text"],
  "strengths": ["array of 2-3 content strengths visible in their writing"],
  "summary": "One sentence describing their overall voice in plain English — be specific to what you read, not generic",
  "openingStyle": "How they typically open their writing — one short descriptive phrase based on the actual samples",
  "postsAnalyzed": ${samplesAnalyzed}
}

Example tone descriptors: Direct, Story-led, Data-driven, Conversational, Authoritative, Inspirational, Humorous, Educational, Vulnerable, Technical, Punchy, Measured
Example patterns: "Starts with a bold claim", "Uses short punchy sentences", "Ends with a reflective question", "Builds tension before payoff", "Grounds advice in personal experience"

CRITICAL: Base your analysis ONLY on what is actually in the samples. Do not infer or invent traits not present. If the writing is casual — say so. If it is formal — say so. Be precise, not flattering.`;

        // ── Call Claude ───────────────────────────────────────────────────────
        const aiResponse = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 600,
            messages: [{
                role: "user",
                content: fingerprintPrompt
            }]
        });

        const rawText = aiResponse.content
            .filter(b => b.type === "text")
            .map(b => b.text)
            .join("");

        // ── Parse JSON response ───────────────────────────────────────────────
        let fingerprint;
        try {
            fingerprint = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        } catch (parseErr) {
            console.error("Voice Fingerprint JSON parse error:", parseErr.message);
            console.error("Raw AI output:", rawText);
            return res.status(500).json({
                message: "Failed to parse voice analysis. Please try again."
            });
        }

        // ── Save to User document ─────────────────────────────────────────────
        await User.findByIdAndUpdate(req.user.id, {
            $set: {
                voiceFingerprint: {
                    ...fingerprint,
                    generatedAt: new Date(),
                }
            }
        });

        console.log(`LOG: Voice Fingerprint saved for user ${req.user.id} — ${samplesAnalyzed} samples analyzed`);

        res.status(200).json({
            success: true,
            fingerprint: {
                ...fingerprint,
                generatedAt: new Date(),
            }
        });

    } catch (error) {
        console.error("Voice Fingerprint Error:", error.message);
        res.status(500).json({
            message: "Failed to generate voice fingerprint",
            error: error.message
        });
    }
};

/* ==========================================================
   FEATURE 4: GET VOICE FINGERPRINT (unchanged)
   Returns the cached fingerprint from User document.
   ========================================================== */
exports.getVoiceFingerprint = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("voiceFingerprint");

        if (!user?.voiceFingerprint?.generatedAt) {
            return res.json({ fingerprint: null });
        }

        res.json({ fingerprint: user.voiceFingerprint });

    } catch (error) {
        console.error("Get Voice Fingerprint Error:", error.message);
        res.status(500).json({ message: "Failed to fetch voice fingerprint" });
    }
};