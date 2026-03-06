const mongoose = require('mongoose');
const { Schema } = mongoose;

const SettingsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Points to your User model
        required: true,
        unique: true
    },
    brandKit: {
        mission: { type: String, default: "" },
        targetAudience: { type: String, default: "" },
        industry: { type: String, default: "saas" },
        terminology: { type: String, default: "" }
    },
    modelConfig: {
        highReasoning: { type: Boolean, default: true },
        temperature: { type: Number, default: 0.7 },
        maxTokens: { type: String, default: "medium" },
        negativePrompt: { type: String, default: "" }
    },
    lastProfileAnalysis: {
        text: { type: String, default: "" },
        audience: { type: String, default: "" },
        tone: { type: String, default: "" },
        analyzedAt: { type: Date }
    }
   
}, { timestamps: true });

module.exports = mongoose.model('settings', SettingsSchema);