const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { JWT_SECRET } = require('./jwt');
const db = require('./database');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        let result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

        if (result.rows.length === 0) {
          result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

          if (result.rows.length > 0) {
            await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, result.rows[0].id]);
          } else {
            result = await db.query(
              'INSERT INTO users (email, google_id, first_name, last_name, email_verified)'
              + ' VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [email, googleId, profile.name.givenName, profile.name.familyName, true],
            );
          }
        }

        return done(null, result.rows[0]);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

module.exports = passport;
