const { hashPassword, comparePassword } = require('../utils/password');

describe('Password Utils', () => {
  it('should hash a password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should compare password correctly', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await comparePassword('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });
});
