import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../model/user.model.js';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from '../config/index.js';
import { OAUTH_PROVIDERS } from '../constants.js';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id: googleId, emails, displayName, photos } = profile;
        const email = emails && emails[0] ? emails[0].value : null;

        if (!email) {
            return done(new Error('Email is required for Google OAuth'), null);
        }

        // Try to find existing user by Google ID first
        let user = await User.findByGoogleId(googleId);

        if (user) {
            return done(null, user);
        }

        // Try to find existing user by email
        user = await User.findOne({ email });

        if (user) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.provider = OAUTH_PROVIDERS.GOOGLE;
            user.isEmailVerified = true; // Google emails are verified
            if (photos && photos[0]) {
                user.avatar = photos[0].value;
            }
            await user.save();
            return done(null, user);
        }

        // Create new user
        const newUser = await User.findOrCreateByGoogleProfile(profile);
        return done(null, newUser);

    } catch (error) {
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
