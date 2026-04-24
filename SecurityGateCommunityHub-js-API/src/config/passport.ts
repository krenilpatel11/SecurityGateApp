import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/user.model';

// Only register Google strategy if credentials are present.
// On Render, env vars must be set in the dashboard — dotenv has no .env file in production.
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: Express.User | false) => void
      ) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0].value,
              avatar: profile.photos?.[0].value,
            });
          }
          return done(null, user as Express.User);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy registered');
} else {
  console.warn('⚠️  Google OAuth env vars missing — Google login disabled. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL in Render dashboard.');
}

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as Express.User);
  } catch (err) {
    done(err as Error, null);
  }
});

export default passport;
