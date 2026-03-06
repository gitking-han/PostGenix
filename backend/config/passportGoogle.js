// D:\secure-ink-folio\backend\config\passportGoogle.js

const passport = require('passport'); // <--- THIS WAS MISSING
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
  
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    // Capture the photo from Google
    const photoUrl = profile.photos?.[0]?.value || profile._json?.picture || "";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        password: "GOOGLE_AUTH"
      });
    }

    // Convert to plain object and attach the photo for the Auth Route
    const userWithPhoto = user.toObject();
    userWithPhoto.googlePhoto = photoUrl; 

    return done(null, userWithPhoto);
  } catch (err) {
    return done(err, null);
  }
}));

// These are also required for passport to function
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));