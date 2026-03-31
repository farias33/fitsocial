import { describe, it, expect } from 'vitest';
import { ChallengePeriod, InvalidChallengePeriodException } from '../value-objects/challenge-period.vo';

const future = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
};

describe('ChallengePeriod value object', () => {
  it('should create a valid period', () => {
    const period = ChallengePeriod.create(future(1), future(30));
    expect(period.durationDays()).toBe(29);
  });

  it('should throw when endDate <= startDate', () => {
    expect(() => ChallengePeriod.create(future(5), future(5))).toThrow(
      InvalidChallengePeriodException,
    );
    expect(() => ChallengePeriod.create(future(5), future(3))).toThrow(
      InvalidChallengePeriodException,
    );
  });

  it('should throw when startDate is in the past', () => {
    const past = new Date('2020-01-01');
    expect(() => ChallengePeriod.create(past, future(10))).toThrow(
      InvalidChallengePeriodException,
    );
  });

  it('should correctly identify active period', () => {
    const period = ChallengePeriod.reconstitute(future(-1), future(10));
    expect(period.isActive()).toBe(true);
    expect(period.hasStarted()).toBe(true);
    expect(period.hasEnded()).toBe(false);
  });

  it('should correctly identify ended period', () => {
    const period = ChallengePeriod.reconstitute(future(-10), future(-1));
    expect(period.hasEnded()).toBe(true);
    expect(period.isActive()).toBe(false);
  });
});
