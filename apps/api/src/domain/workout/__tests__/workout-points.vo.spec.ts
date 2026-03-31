import { describe, it, expect } from 'vitest';
import { WorkoutPoints, InvalidWorkoutPointsException } from '../value-objects/workout-points.vo';

describe('WorkoutPoints value object', () => {
  it('should create with default value of 1', () => {
    expect(WorkoutPoints.default().value).toBe(1);
  });

  it('should create valid points between 1 and 10', () => {
    expect(WorkoutPoints.create(1).value).toBe(1);
    expect(WorkoutPoints.create(10).value).toBe(10);
    expect(WorkoutPoints.create(5).value).toBe(5);
  });

  it('should throw for value below minimum', () => {
    expect(() => WorkoutPoints.create(0)).toThrow(InvalidWorkoutPointsException);
    expect(() => WorkoutPoints.create(-1)).toThrow(InvalidWorkoutPointsException);
  });

  it('should throw for value above maximum', () => {
    expect(() => WorkoutPoints.create(11)).toThrow(InvalidWorkoutPointsException);
  });

  it('should throw for non-integer value', () => {
    expect(() => WorkoutPoints.create(2.5)).toThrow(InvalidWorkoutPointsException);
  });

  it('should compare equality correctly', () => {
    expect(WorkoutPoints.create(3).equals(WorkoutPoints.create(3))).toBe(true);
    expect(WorkoutPoints.create(3).equals(WorkoutPoints.create(5))).toBe(false);
  });
});
