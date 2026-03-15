const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const passport = require('passport');
const axios = require('axios');
const Profile = require('../models/Profile');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const Settings = require('../models/Settings');
const { checkAndResetCredits } = require('../utils/creditManager');

const JWT_SECRET = process.env.JWT_SECRET;

// ==========================
// Nodemailer Config (FIXED)
// ==========================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const resetEmailTemplate = (resetUrl) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">PostGenix</h1>
    </div>
    <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
      <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to proceed. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
    </div>
  </div>
`;

async function generateUsername(firstName = '', lastName = '') {
  let base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!base) base = 'user';
  let username = base;
  let count = 1;
  while (await Profile.findOne({ username })) {
    username = `${base}${count++}`;
  }
  return username;
}

// ==========================
// Route 1 & 2: Create & Login (Kept as is)
// ==========================

router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    // Check if user exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ success: false, error: "User with this email already exists" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // 1. Create the User
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });

    // --- NEW PROFILE LOGIC START ---

    // 2. Prepare Name and Username
    const nameParts = req.body.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || ''; // Captures middle/last names
    const username = await generateUsername(firstName, lastName);

    // 3. Create the Profile automatically
    await Profile.create({
      userId: user.id,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      username: username,
      headline: 'Content Creator | PostGenix',
      isPublic: true,
      avatarUrl: '' // Default empty or a placeholder URL
    });

    // --- NEW PROFILE LOGIC END ---

    // Generate JWT
    const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
    res.json({ success: true, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: false, message: 'Failed to create user and profile' });
  }
});

router.post('/login', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password must not be blank').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: "Invalid credentials" });
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) return res.status(400).json({ success: false, error: "Invalid credentials" });
    const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
    res.json({ success: true, authToken });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// ==========================
// Route 4: Google OAuth (Kept as is)
// ==========================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    let profile = await Profile.findOne({ userId: user._id });
    const username = profile?.username || await generateUsername(user.name?.split(' ')[0], user.name?.split(' ')[1]);
    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: { firstName: user.name?.split(' ')[0] || '', lastName: user.name?.split(' ')[1] || '', avatarUrl: user.googlePhoto || '', username, headline: 'Content Creator | PostGenix', isPublic: true },
        $set: { email: user.email }
      },
      { new: true, upsert: true }
    );
    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  }
}
);

// // ==========================
// // Route 5: LinkedIn OAuth (FIXED - Now Responds)
// // ==========================
// router.get('/linkedin', (req, res) => {
//   const redirectUri = `${process.env.BASE_URL}/api/auth/linkedin/callback`;
//   const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;
//   res.redirect(authUrl);
// });

// router.get('/linkedin/callback', async (req, res) => {
//   const { code } = req.query;
//   if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

//   try {
//     // 1. Exchange code for access token
//     const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
//       params: {
//         grant_type: 'authorization_code',
//         code,
//         client_id: process.env.LINKEDIN_CLIENT_ID,
//         client_secret: process.env.LINKEDIN_CLIENT_SECRET,
//         redirect_uri: `${process.env.BASE_URL}/api/auth/linkedin/callback`,
//       },
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//     });

//     const accessToken = tokenResponse.data.access_token;

//     // 2. Get User Info
//     const userRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });

//     const { sub, name, given_name, family_name, picture, email } = userRes.data;

//     // 3. Find or Create User
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name: name,
//         email: email,
//         password: crypto.randomBytes(16).toString('hex') // Random password for OAuth users
//       });
//     }

//     // 4. Update Profile
//     const username = await generateUsername(given_name, family_name);
//     await Profile.findOneAndUpdate(
//       { userId: user._id },
//       {
//         $setOnInsert: { firstName: given_name, lastName: family_name, avatarUrl: picture, username, isPublic: true },
//         $set: { email: email }
//       },
//       { upsert: true }
//     );

//     const jwtToken = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '24h' });
//     res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${jwtToken}`);

//   } catch (err) {
//     console.error("LinkedIn Error:", err.response?.data || err.message);
//     res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_failed`);
//   }
// });

// ==========================
// Route 6 & 7: Forgot & Reset Password (FIXED)
// ==========================
router.post('/forgot-password', [
  body('email', 'Enter a valid Email').isEmail()
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: "If account exists, email sent." });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      from: `"PostGenix Support" <${process.env.EMAIL_USER}>`,
      subject: 'Password Reset Request',
      html: resetEmailTemplate(resetUrl)
    });

    res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("Forgot Pass Error:", error);
    res.status(500).json({ success: false, message: "Error sending reset email" });
  }
});

router.post('/reset-password/:token', [
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, error: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Error" });
  }
});

router.get('/test', (req, res) => {
  res.send("Auth router is connected!");
});
router.put('/update-password', fetchuser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Find the user
    const User = require('../models/User'); // Ensure path is correct
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Check if the current password is correct
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 3. Hash and save the new password
    const salt = await bcrypt.genSalt(10);
    const securedPassword = await bcrypt.hash(newPassword, salt);

    user.password = securedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// router: /api/auth/delete-account
// middleware: fetchuser (to get the user ID from the token)

router.delete('/delete-account', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;

    await Post.deleteMany({ user: userId });

    await Conversation.deleteMany({ user: userId });

    await Settings.deleteOne({ user: userId });

    await Profile.deleteOne({ userId: userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Account and all associated data (posts, conversations, settings, profile) have been purged."
    });

  } catch (error) {
    console.error("Purge Error:", error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});



// ROUTE: GET "/api/auth/get-user" - Fetch user details with Onboarding Progress.
// ROUTE: GET "/api/auth/get-user"
router.get('/get-user', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    user = await checkAndResetCredits(user);

    // The spotlight only shows if they haven't completed the profile 
    // AND they haven't clicked "Got it" yet.
    const showSpotlight = user.onboarding?.showProfileGuide && !user.onboarding?.hasCompletedProfile;

    res.json({
      ...user._doc,
      showSpotlight // Simple true/false for the frontend
    });

  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
// ============================================================
// ROUTE: LINKEDIN AGENTIC OAUTH (Unified Login & Connect)
// ============================================================

/**
 * @route   GET /api/auth/linkedin/connect
 * @desc    Connect LinkedIn for AI Agent (Logged-in user)
 */
router.get('/linkedin/connect', fetchuser, (req, res) => {
  const userId = req.user.id.toString();
  const redirectUri = `${process.env.BASE_URL}/api/auth/linkedin/callback`;
  const scope = "openid profile email w_member_social";

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${userId}&` +
    `scope=${encodeURIComponent(scope)}`;

  console.log("LOG: Initiating LinkedIn Connect for User:", userId);
  res.redirect(authUrl);
});

/**
 * @route   GET /api/auth/linkedin
 * @desc    Login via LinkedIn (Logged-out user)
 */
router.get('/linkedin', (req, res) => {
  const redirectUri = `${process.env.BASE_URL}/api/auth/linkedin/callback`;
  const scope = "openid profile email"; // Minimum scope for login
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authUrl);
});

/**
 * @route   GET /api/auth/linkedin/callback
 * @desc    SINGLE Unified Callback handler
 */
router.get('/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  console.log("!!! LINKEDIN CALLBACK REACHED !!!");

  if (error) {
    console.error("LinkedIn OAuth Error:", error, error_description);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
  }

  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

  try {
    console.log("LOG: Exchanging code for Access Token...");

    // FIX: Use URLSearchParams to send data in the REQUEST BODY (Fixes "code not found" error)
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
    params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);
    params.append('redirect_uri', `${process.env.BASE_URL}/api/auth/linkedin/callback`);

    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;
    console.log("LOG: Access Token obtained.");

    // Fetch user profile
    const userRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { sub, name, email, given_name, family_name, picture } = userRes.data;
    const personUrn = `urn:li:person:${sub}`;

    if (state) {
      // SCENARIO: AGENT CONNECTION (User was already logged in)
      console.log("LOG: Updating existing user with LinkedIn Keys. ID:", state);

      const updatedUser = await User.findByIdAndUpdate(state, {
        $set: {
          'linkedin.accessToken': accessToken,
          'linkedin.personUrn': personUrn,
          'linkedin.profileName': name,
          'linkedin.isConnected': true
        }
      }, { new: true });

      if (updatedUser) {
        console.log("LOG: SUCCESS! Database updated for:", updatedUser.email);
      } else {
        console.error("LOG: User ID from state not found in database.");
      }

      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?linkedin=connected`);

    } else {
      // SCENARIO: STANDARD LOGIN
      console.log("LOG: Processing LinkedIn Login for:", email);
      let user = await User.findOne({ email });

      if (!user) {
        const username = await generateUsername(given_name, family_name);
        user = await User.create({
          name: name,
          email: email,
          password: crypto.randomBytes(16).toString('hex'),
          linkedin: { accessToken, personUrn, profileName: name, isConnected: true }
        });

        await Profile.create({
          userId: user._id,
          firstName: given_name,
          lastName: family_name,
          avatarUrl: picture,
          username,
          isPublic: true
        });
      } else {
        // Refresh tokens even on login
        user.linkedin.accessToken = accessToken;
        user.linkedin.personUrn = personUrn;
        user.linkedin.isConnected = true;
        await user.save();
      }

      const jwtToken = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '24h' });
      return res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${jwtToken}`);
    }

  } catch (err) {
    console.error("LOG: CRITICAL ERROR IN CALLBACK");
    if (err.response) {
      console.error("LinkedIn Response:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_failed`);
  }
});


/**
 * @route   PUT /api/auth/linkedin/disconnect
 * @desc    Disconnect LinkedIn and clear tokens
 */
router.put('/linkedin/disconnect', fetchuser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        'linkedin.accessToken': null,
        'linkedin.personUrn': null,
        'linkedin.profileName': null,
        'linkedin.isConnected': false
      }
    });

    res.json({ success: true, message: "LinkedIn account disconnected." });
  } catch (error) {
    console.error("Disconnect Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ==========================
// Utility Routes (Kept)
// ==========================
router.get('/test', (req, res) => { res.send("Auth router is connected!"); });


/**
 * @route   PUT /api/auth/onboarding/dismiss-tip
 * @desc    Dismiss the first-time profile setup tip
 */
/**
 * @route   PUT /api/auth/onboarding/dismiss-guide
 * @desc    Dismiss the floating profile guide permanently
 */
router.put('/onboarding/dismiss-guide', fetchuser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { 'onboarding.showProfileGuide': false }
    });
    res.json({ success: true, message: "Guide dismissed" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;