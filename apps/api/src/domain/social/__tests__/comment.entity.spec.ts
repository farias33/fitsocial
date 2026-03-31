import { describe, it, expect } from 'vitest';
import { Comment } from '../entities/comment.entity';
import {
  CommentUnauthorizedException,
  CommentTooLongException,
} from '../errors/social.errors';

describe('Comment entity', () => {
  it('should create comment with trimmed body', () => {
    const c = Comment.create('user-1', 'workout-1', '  Great work!  ');
    expect(c.body).toBe('Great work!');
  });

  it('should throw CommentTooLongException for body > 500 chars', () => {
    const longBody = 'a'.repeat(501);
    expect(() => Comment.create('user-1', 'workout-1', longBody)).toThrow(
      CommentTooLongException,
    );
  });

  it('should throw CommentUnauthorizedException when non-owner deletes', () => {
    const c = Comment.create('user-1', 'workout-1', 'Nice!');
    expect(() => c.assertOwnership('user-2')).toThrow(CommentUnauthorizedException);
  });

  it('should allow owner to edit', () => {
    const c = Comment.create('user-1', 'workout-1', 'Original');
    const before = c.updatedAt;
    c.edit('Updated body', 'user-1');
    expect(c.body).toBe('Updated body');
    expect(c.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should throw when non-owner tries to edit', () => {
    const c = Comment.create('user-1', 'workout-1', 'Original');
    expect(() => c.edit('Hacked!', 'user-2')).toThrow(CommentUnauthorizedException);
  });
});
