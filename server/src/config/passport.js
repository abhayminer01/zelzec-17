const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            // Check if user exists by googleId
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            // Check if user exists by email
            if (profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = await User.findOne({ email: email });
                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    if (!user.isVerified) user.isVerified = true; // Trust Google verified email
                    await user.save();
                    return done(null, user);
                }
            }

            // Create new user
            user = await User.create({
                googleId: profile.id,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
                full_name: profile.displayName,
                isVerified: true,
                // Leave other fields empty/undefined for now
            });

            return done(null, user);

        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
