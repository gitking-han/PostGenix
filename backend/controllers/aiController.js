const User = require('../models/User');
const Settings = require('../models/Settings');
const axios = require('axios'); // Added for LinkedIn API calls

const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

// 2. Initialize the client
const bedrockClient = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    },
});

/* ==========================================================
   FEATURE 2: LINKEDIN AGENTIC TOOL DEFINITION
   ========================================================== */
const linkedinTool = {
    toolSpec: {
        name: "create_linkedin_post",
        description: "Formats and sends a post to the user's LinkedIn profile. Use this when the user wants to draft or publish a post.",
        inputSchema: {
            json: {
                type: "object",
                properties: {
                    commentary: {
                        type: "string",
                        description: "The main text of the post. Should include the body and any relevant hashtags."
                    }
                },
                required: ["commentary"]
            }
        }
    }
};

/* ==========================================================
   FEATURE 1: ANALYZE PROFILE (Existing)
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

        const imageBytes = new Uint8Array(req.file.buffer);

        const command = new ConverseCommand({
            modelId: "amazon.nova-lite-v1:0",
            messages: [
                {
                    role: "user",
                    content: [
                        { text: analysisPrompt },
                        {
                            image: {
                                format: req.file.mimetype === 'image/png' ? 'png' : 'jpeg',
                                source: { bytes: imageBytes }
                            }
                        }
                    ]
                }
            ],
            inferenceConfig: {
                maxTokens: 1500,
                temperature: 0.5
            }
        });

        const response = await bedrockClient.send(command);
        const analysisResults = response.output.message.content[0].text;

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
                console.error("Failed to parse Nova JSON data", e);
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

        // // Inside analyzeProfile (after successful analysisResults)
        // await User.findByIdAndUpdate(req.user.id, {
        //     $set: { 'onboarding.hasAnalyzedProfile': true }
        // });

    } catch (error) {
        console.error("Multimodal Analysis Error:", error);
        res.status(500).json({ message: "Analysis failed", error: error.message });
    }
};

/* ==========================================================
   FEATURE 2: AUTO-DRAFT TO LINKEDIN (Agentic Action)
   ========================================================== */
exports.autoDraftToLinkedIn = async (req, res) => {
    try {
        const { postContent } = req.body;
        const user = await User.findById(req.user.id);

        // 1. Check if user is connected
        if (!user.linkedin || !user.linkedin.isConnected) {
            return res.status(400).json({
                message: "LinkedIn not connected.",
                action: "Please connect your LinkedIn account in settings."
            });
        }

        // 2. Nova "Reasons" about the post and decides to use the tool
        // We use Nova Pro for better reasoning in tool-calling
        const command = new ConverseCommand({
            modelId: "amazon.nova-pro-v1:0",
            messages: [{
                role: "user",
                content: [{ text: `I want to post this content to my LinkedIn. Please format it properly and use the tool to draft it: ${postContent}` }]
            }],
            toolConfig: {
                tools: [linkedinTool]
            }
        });

        const response = await bedrockClient.send(command);

        // 3. Check if Nova requested to use the tool
        const stopReason = response.stopReason;

        if (stopReason === "tool_use") {
            const toolCall = response.output.message.content.find(c => c.toolUse);
            const { commentary } = toolCall.toolUse.input;

            // 4. THE ACTION: Execute the actual LinkedIn API call
            const linkedinRes = await axios.post('https://api.linkedin.com/v2/posts', {
                author: user.linkedin.personUrn, // stored during OAuth
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

            // 2. Build the URL (LinkedIn URLs work best with the URN)
            let linkedinUrl = "";
            if (linkedinId) {
                // If it's a full URN (urn:li:share:123), it works in the feed/update path
                linkedinUrl = `https://www.linkedin.com/feed/update/${linkedinId}/`;
            }

            return res.status(200).json({
                message: "Post successfully dispatched!",
                linkedinUrl: linkedinUrl // This will now have the real ID
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