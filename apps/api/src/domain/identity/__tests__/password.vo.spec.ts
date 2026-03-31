import { describe, it, expect } from 'vitest';
import { HashedPassword, WeakPasswordException } from '../value-objects/password.vo';

describe('HashedPassword value object', () => {
  it('should throw WeakPasswordException for passwords shorter than 8 chars', async () => {
    await expect(HashedPassword.fromPlainText('1234567')).rejects.toThrow(
      WeakPasswordException,
    );
  });

  it('should hash the password and verify correctly', async () => {
    const pwd = await HashedPassword.fromPlainText('securePass123');
    expect(await pwd.verify('securePass123')).toBe(true);
    expect(await pwd.verify('wrongPassword')).toBe(false);
  });

  it('should not store plain text — hash must differ from input', async () => {
    const plain = 'securePass123';
    const pwd = await HashedPassword.fromPlainText(plain);
    expect(pwd.toString()).not.toBe(plain);
    expect(pwd.toString()).toMatch(/^\$2b\$/); // bcrypt prefix
  });
});
