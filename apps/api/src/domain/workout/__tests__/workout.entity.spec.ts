import { describe, it, expect } from 'vitest';
import { Workout } from '../entities/workout.entity';
import { WorkoutMedia } from '../entities/workout-media.entity';
import { WorkoutPoints } from '../value-objects/workout-points.vo';
import { WorkoutUnauthorizedException } from '../errors/workout.errors';

const makeWorkout = (overrides: Partial<{ userId: string }> = {}) =>
  Workout.create({
    userId: overrides.userId ?? 'user-1',
    challengeId: 'challenge-1',
    title: 'Leg day',
    description: 'Heavy squats',
    points: WorkoutPoints.create(3),
  });

describe('Workout entity', () => {
  it('should create with empty media list', () => {
    const w = makeWorkout();
    expect(w.media).toHaveLength(0);
    expect(w.readyMediaCount()).toBe(0);
  });

  it('should identify owner correctly', () => {
    const w = makeWorkout({ userId: 'user-1' });
    expect(w.isOwnedBy('user-1')).toBe(true);
    expect(w.isOwnedBy('user-2')).toBe(false);
  });

  it('should throw WorkoutUnauthorizedException when non-owner asserts ownership', () => {
    const w = makeWorkout({ userId: 'user-1' });
    expect(() => w.assertOwnership('user-2')).toThrow(WorkoutUnauthorizedException);
  });

  it('should not throw when owner asserts ownership', () => {
    const w = makeWorkout({ userId: 'user-1' });
    expect(() => w.assertOwnership('user-1')).not.toThrow();
  });

  it('should attach media and update updatedAt', () => {
    const w = makeWorkout();
    const before = w.updatedAt;
    const media = WorkoutMedia.create(w.id, 'workouts/abc/original.jpg');
    w.attachMedia(media);
    expect(w.media).toHaveLength(1);
    expect(w.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should count only ready media', () => {
    const w = makeWorkout();
    const m1 = WorkoutMedia.create(w.id, 'key1');
    const m2 = WorkoutMedia.create(w.id, 'key2');
    m1.markAsReady('thumb1.webp', 'medium1.webp');
    w.attachMedia(m1);
    w.attachMedia(m2); // still PROCESSING
    expect(w.readyMediaCount()).toBe(1);
  });

  it('should serialise to plain object', () => {
    const w = makeWorkout();
    const json = w.toJSON();
    expect(json.points).toBe(3);
    expect(json.challengeId).toBe('challenge-1');
  });
});
