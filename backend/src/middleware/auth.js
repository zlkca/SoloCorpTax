const passport = require('../config/passport');

function authenticateJWT(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    return next();
  })(req, res, next);
}

module.exports = authenticateJWT;
