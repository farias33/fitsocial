import { DomainError } from '@shared/domain/domain-error';

export const ALLOWED_EMOJIS = ['💪', '🔥', '👏', '⚡', '🏆'] as const;
export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

export class InvalidReactionEmojiException extends DomainError {
  constructor(emoji: string) {
    super(
      `Emoji não permitido: "${emoji}". Permitidos: ${ALLOWED_EMOJIS.join(' ')}`,
      'SOCIAL_INVALID_EMOJI',
    );
  }
}

export class ReactionEmoji {
  private constructor(private readonly _value: AllowedEmoji) {}

  static create(raw: string): ReactionEmoji {
    if (!(ALLOWED_EMOJIS as readonly string[]).includes(raw)) {
      throw new InvalidReactionEmojiException(raw);
    }
    return new ReactionEmoji(raw as AllowedEmoji);
  }

  static default(): ReactionEmoji {
    return new ReactionEmoji('💪');
  }

  static reconstitute(stored: string): ReactionEmoji {
    return new ReactionEmoji(stored as AllowedEmoji);
  }

  get value(): AllowedEmoji { return this._value; }

  equals(other: ReactionEmoji): boolean {
    return this._value === other._value;
  }
}
