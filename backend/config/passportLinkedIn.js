const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/linkedin/callback`,
      scope: ['openid', 'profile', 'email'],
      state: true,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        /**
         * LinkedIn OpenID Connect:
         * - email is NOT in profile
         * - it is inside the ID token
         */
        const idToken = req.query.id_token || req.authInfo?.id_token;

        if (!idToken) {
          return done(new Error('No id_token received from LinkedIn'), null);
        }

        const decoded = jwt.decode(idToken);

        const email = decoded.email;
        const name =
          decoded.name ||
          `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim();

        if (!email) {
          return done(new Error('LinkedIn did not return email'), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: name || 'LinkedIn User',
            email,
            password: 'LINKEDIN_AUTH'
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// required even if session:false
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
