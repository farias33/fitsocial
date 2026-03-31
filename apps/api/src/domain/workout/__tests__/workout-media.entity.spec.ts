import { describe, it, expect } from 'vitest';
import { WorkoutMedia } from '../entities/workout-media.entity';
import { MediaStatus } from '../value-objects/media-status.vo';

describe('WorkoutMedia entity', () => {
  it('should start with PROCESSING status', () => {
    const m = WorkoutMedia.create('workout-1', 'workouts/w1/original.jpg');
    expect(m.status).toBe(MediaStatus.PROCESSING);
    expect(m.isReady()).toBe(false);
  });

  it('should transition to READY with URLs', () => {
    const m = WorkoutMedia.create('workout-1', 'key');
    m.markAsReady('thumb.webp', 'medium.webp');
    expect(m.status).toBe(MediaStatus.READY);
    expect(m.isReady()).toBe(true);
    expect(m.thumbnailUrl).toBe('thumb.webp');
    expect(m.mediumUrl).toBe('medium.webp');
  });

  it('should transition to FAILED', () => {
    const m = WorkoutMedia.create('workout-1', 'key');
    m.markAsFailed();
    expect(m.status).toBe(MediaStatus.FAILED);
    expect(m.isReady()).toBe(false);
  });
});
