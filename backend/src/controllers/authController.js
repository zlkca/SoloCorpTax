const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

async function register(req, res) {
  try {
    const {
      email, password, firstName, lastName,
    } = req.body;

    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name)'
      + ' VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
      [email, passwordHash, firstName, lastName],
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt],
    );

    return res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Please use Google login' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt],
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken);

    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()',
      [payload.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({ userId: payload.userId });

    return res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function googleCallback(req, res) {
  try {
    const { user } = req;

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt],
    );

    const frontendUrl = process.env.FRONTEND_URL;
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [payload.userId]);
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.json({ message: 'Logged out' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const { user } = req;
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  googleCallback,
  logout,
  getCurrentUser,
};
