import { describe, it, expect } from 'vitest';
import { Email, InvalidEmailException } from '../value-objects/email.vo';

describe('Email value object', () => {
  it('should normalise to lowercase', () => {
    const email = Email.create('Atlas@FitSocial.COM');
    expect(email.toString()).toBe('atlas@fitsocial.com');
  });

  it('should throw InvalidEmailException for invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow(InvalidEmailException);
    expect(() => Email.create('@no-local.com')).toThrow(InvalidEmailException);
    expect(() => Email.create('no-at-sign')).toThrow(InvalidEmailException);
  });

  it('should be equal when same normalised value', () => {
    const a = Email.create('user@fitsocial.com');
    const b = Email.create('USER@FITSOCIAL.COM');
    expect(a.equals(b)).toBe(true);
  });
});
