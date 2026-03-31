import { describe, it, expect } from 'vitest';
import { Challenge, ChallengeStatus } from '../entities/challenge.entity';
import { ChallengePeriod } from '../value-objects/challenge-period.vo';
import { AlreadyParticipatingException, ChallengeNotActiveException } from '../errors/challenge.errors';

const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const makePeriod = (startOffset = 1, endOffset = 30) =>
  ChallengePeriod.reconstitute(future(startOffset), future(endOffset));

const makeChallenge = (overrides: Partial<{ startOffset: number; endOffset: number }> = {}) =>
  Challenge.create({
    name: 'Desafio Janeiro',
    description: null,
    period: makePeriod(overrides.startOffset, overrides.endOffset),
    createdById: 'user-creator',
  });

describe('Challenge entity', () => {
  it('should auto-add creator as participant on create', () => {
    const c = makeChallenge();
    expect(c.hasParticipant('user-creator')).toBe(true);
    expect(c.participantCount).toBe(1);
  });

  it('should start with UPCOMING status', () => {
    const c = makeChallenge();
    expect(c.status).toBe(ChallengeStatus.UPCOMING);
  });

  it('should activate when start date has passed', () => {
    const c = makeChallenge({ startOffset: -1 });
    c.syncStatus();
    expect(c.status).toBe(ChallengeStatus.ACTIVE);
  });

  it('should end when end date has passed', () => {
    const c = makeChallenge({ startOffset: -10, endOffset: -1 });
    c.syncStatus();
    expect(c.status).toBe(ChallengeStatus.ENDED);
  });

  it('should allow a new user to join an active challenge', () => {
    const c = makeChallenge({ startOffset: -1 });
    c.syncStatus();
    c.addParticipant('user-2');
    expect(c.hasParticipant('user-2')).toBe(true);
    expect(c.participantCount).toBe(2);
  });

  it('should throw AlreadyParticipatingException on duplicate join', () => {
    const c = makeChallenge({ startOffset: -1 });
    c.syncStatus();
    expect(() => c.addParticipant('user-creator')).toThrow(AlreadyParticipatingException);
  });

  it('should throw ChallengeNotActiveException when challenge has ended', () => {
    const c = makeChallenge({ startOffset: -10, endOffset: -1 });
    c.syncStatus();
    expect(() => c.addParticipant('user-new')).toThrow(ChallengeNotActiveException);
  });

  it('should identify owner correctly', () => {
    const c = makeChallenge();
    expect(c.isCreatedBy('user-creator')).toBe(true);
    expect(c.isCreatedBy('user-other')).toBe(false);
  });
});
