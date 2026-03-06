const axios = require('axios');
const User = require('../models/User');

// 1. Redirect to LinkedIn Login
exports.getAuthUrl = (req, res) => {
    const scope = encodeURIComponent('openid profile w_member_social email');
    const redirectUri = encodeURIComponent(`${process.env.BASE_URL}/api/auth/linkedin/callback`);
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&state=${req.user.id}&scope=${scope}`;
    
    res.json({ url });
};

// 2. Callback: Exchange code for Token and URN
exports.handleCallback = async (req, res) => {
    const { code, state } = req.query; // state contains our userId
    const redirectUri = `${process.env.BASE_URL}/api/auth/linkedin/callback`;

    try {
        // Exchange Code for Access Token
        const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET,
                redirect_uri: redirectUri
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenRes.data.access_token;

        // Get User's Profile URN (Using OpenID Connect)
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const personUrn = `urn:li:person:${profileRes.data.sub}`; // The 'sub' field is the ID

        // Update User in DB
        await User.findByIdAndUpdate(state, {
            'linkedin.accessToken': accessToken,
            'linkedin.personUrn': personUrn,
            'linkedin.profileName': profileRes.data.name,
            'linkedin.isConnected': true
        });

        // Redirect back to frontend settings or write page
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?status=connected`);

    } catch (error) {
        console.error("LinkedIn Auth Error:", error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?status=error`);
    }
};