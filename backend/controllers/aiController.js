const User = require('../models/User');
const Settings = require('../models/Settings');
const axios = require('axios');
const Anthropic = require("@anthropic-ai/sdk"); // ✅ CHANGED: Replaced AWS SDK with Anthropic SDK

// ✅ CHANGED: Replaced BedrockRuntimeClient with Anthropic client
const anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/* ==========================================================
   FEATURE 2: LINKEDIN AGENTIC TOOL DEFINITION
   ✅ CHANGED: Anthropic tool format is different from Bedrock
   Bedrock used: { toolSpec: { name, description, inputSchema: { json: {...} } } }
   Anthropic uses: { name, description, input_schema: {...} }  (flat, no wrapper)
   ========================================================== */
const linkedinTool = {
    name: "create_linkedin_post",
    description: "Formats and sends a post to the user's LinkedIn profile. Use this when the user wants to draft or publish a post.",
    input_schema: {                          // ✅ CHANGED: was inputSchema.json, now input_schema
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
   FEATURE 1: ANALYZE PROFILE
   ✅ CHANGED: nova-lite → claude-haiku-4-5-20251001
   Haiku 4.5 supports vision (images) natively — fast and cheap
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

        // ✅ CHANGED: Anthropic requires raw base64 string (not Uint8Array like Bedrock)
        const base64Image = req.file.buffer.toString('base64');

        // ✅ CHANGED: Detect media type properly (supports jpeg, png, gif, webp)
        const mediaType = req.file.mimetype; // e.g. "image/png" or "image/jpeg"

        // ✅ CHANGED: Anthropic image format — image block comes BEFORE text (best practice per docs)
        const response = await anthropicClient.messages.create({
            model: "claude-haiku-4-5-20251001",  // ✅ CHANGED: was amazon.nova-lite-v1:0
            max_tokens: 1500,
            temperature: 0.5,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            // ✅ CHANGED: Anthropic image block format
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,  // "image/jpeg" or "image/png" etc.
                                data: base64Image,      // raw base64 string, no data URL prefix
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

        // ✅ CHANGED: Anthropic response format
        // was: response.output.message.content[0].text
        // now: response.content[0].text
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
   FEATURE 2: AUTO-DRAFT TO LINKEDIN (Agentic Action)
   ✅ CHANGED: nova-pro → claude-sonnet-4-6
   Sonnet 4.6 is the recommended model for agentic tool calling
   ========================================================== */
exports.autoDraftToLinkedIn = async (req, res) => {
    try {
        const { postContent } = req.body;
        const user = await User.findById(req.user.id);

        // 1. Check if user is connected (unchanged)
        if (!user.linkedin || !user.linkedin.isConnected) {
            return res.status(400).json({
                message: "LinkedIn not connected.",
                action: "Please connect your LinkedIn account in settings."
            });
        }

        // ✅ CHANGED: Replaced ConverseCommand with anthropicClient.messages.create()
        // Sonnet 4.6 replaces Nova Pro for agentic/tool-calling tasks
        const response = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",          // ✅ CHANGED: was amazon.nova-pro-v1:0
            max_tokens: 1000,
            tools: [linkedinTool],               // ✅ CHANGED: Anthropic tools array format
            messages: [{
                role: "user",
                content: `I want to post this content to my LinkedIn. Please format it properly and use the tool to draft it: ${postContent}`
            }]
        });

        // ✅ CHANGED: Anthropic stop reason for tool use is "tool_use" (same name, different structure)
        // Bedrock: response.stopReason === "tool_use", content.find(c => c.toolUse)
        // Anthropic: response.stop_reason === "tool_use", content.find(c => c.type === "tool_use")
        const stopReason = response.stop_reason;

        if (stopReason === "tool_use") {
            // ✅ CHANGED: Anthropic tool call block uses type === "tool_use" and block.input
            // Bedrock used: c.toolUse and toolCall.toolUse.input
            const toolCall = response.content.find(c => c.type === "tool_use");
            const { commentary } = toolCall.input;  // ✅ CHANGED: was toolCall.toolUse.input

            // 4. THE ACTION: Execute the actual LinkedIn API call (unchanged)
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

            const linkedinId = linkedinRes.data.id || linkedinRes.headers['x-restli-id'] || linkedinRes.headers['x-linkedin-id'];

            console.log("LOG: Captured LinkedIn ID:", linkedinId);

            let linkedinUrl = "";
            if (linkedinId) {
                linkedinUrl = `https://www.linkedin.com/feed/update/${linkedinId}/`;
            }

            return res.status(200).json({
                message: "Post successfully dispatched!",
                linkedinUrl: linkedinUrl
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