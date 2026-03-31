import { describe, it, expect } from 'vitest';
import { Reaction } from '../entities/reaction.entity';
import { ReactionEmoji } from '../value-objects/reaction-emoji.vo';

describe('Reaction entity', () => {
  it('should create with given emoji', () => {
    const r = Reaction.create('user-1', 'workout-1', ReactionEmoji.create('🔥'));
    expect(r.emoji.value).toBe('🔥');
    expect(r.userId).toBe('user-1');
    expect(r.workoutId).toBe('workout-1');
  });

  it('should identify ownership correctly', () => {
    const r = Reaction.create('user-1', 'workout-1', ReactionEmoji.default());
    expect(r.isOwnedBy('user-1')).toBe(true);
    expect(r.isOwnedBy('user-2')).toBe(false);
  });

  it('should serialise to plain object', () => {
    const r = Reaction.create('user-1', 'workout-1', ReactionEmoji.create('💪'));
    const json = r.toJSON();
    expect(json.emoji).toBe('💪');
    expect(json.userId).toBe('user-1');
  });
});
