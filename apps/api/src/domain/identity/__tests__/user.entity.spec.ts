import { describe, it, expect } from 'vitest';
import { User, UserRole } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';

describe('User entity', () => {
  const makeUser = () =>
    User.create({
      email: Email.create('atlas@fitsocial.com'),
      username: Username.create('atlas'),
      passwordHash: null,
      displayName: 'Atlas Silva',
    });

  it('should create user with generated id and default role USER', () => {
    const user = makeUser();
    expect(user.id).toBeDefined();
    expect(user.role).toBe(UserRole.USER);
    expect(user.avatarUrl).toBeNull();
  });

  it('should update display name', () => {
    const user = makeUser();
    const before = user.updatedAt;
    user.updateProfile({ displayName: 'Atlas Atualizado' });
    expect(user.displayName).toBe('Atlas Atualizado');
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should set bio to null when empty string provided', () => {
    const user = makeUser();
    user.updateProfile({ bio: '  ' });
    expect(user.bio).toBeNull();
  });

  it('should serialise to plain object via toJSON', () => {
    const user = makeUser();
    const json = user.toJSON();
    expect(json.email).toBe('atlas@fitsocial.com');
    expect(json.username).toBe('atlas');
  });
});
