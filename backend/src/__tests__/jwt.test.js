const {
  generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken,
} = require('../config/jwt');

describe('JWT Utils', () => {
  const payload = { userId: 123 };

  it('should generate and verify access token', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('should generate and verify refresh token', () => {
    const token = generateRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('should throw error for invalid token', () => {
    expect(() => {
      verifyAccessToken('invalid-token');
    }).toThrow();
  });
});
