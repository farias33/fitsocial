import { describe, it, expect } from 'vitest';
import { ReactionEmoji, InvalidReactionEmojiException } from '../value-objects/reaction-emoji.vo';

describe('ReactionEmoji value object', () => {
  it('should create valid emojis', () => {
    expect(ReactionEmoji.create('💪').value).toBe('💪');
    expect(ReactionEmoji.create('🔥').value).toBe('🔥');
    expect(ReactionEmoji.create('🏆').value).toBe('🏆');
  });

  it('should throw for invalid emoji', () => {
    expect(() => ReactionEmoji.create('😀')).toThrow(InvalidReactionEmojiException);
    expect(() => ReactionEmoji.create('x')).toThrow(InvalidReactionEmojiException);
  });

  it('should return default 💪 emoji', () => {
    expect(ReactionEmoji.default().value).toBe('💪');
  });

  it('should compare equality correctly', () => {
    const a = ReactionEmoji.create('🔥');
    const b = ReactionEmoji.create('🔥');
    const c = ReactionEmoji.create('💪');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
