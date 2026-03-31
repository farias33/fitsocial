import { describe, it, expect } from 'vitest';
import { Username, InvalidUsernameException } from '../value-objects/username.vo';

describe('Username value object', () => {
  it('should normalise to lowercase', () => {
    expect(Username.create('AtlasUser').toString()).toBe('atlasuser');
  });

  it('should throw for username shorter than 3 chars', () => {
    expect(() => Username.create('ab')).toThrow(InvalidUsernameException);
  });

  it('should throw for username with invalid characters', () => {
    expect(() => Username.create('user name')).toThrow(InvalidUsernameException);
    expect(() => Username.create('user@name')).toThrow(InvalidUsernameException);
  });

  it('should accept letters, numbers and underscores', () => {
    expect(() => Username.create('user_123')).not.toThrow();
  });
});
