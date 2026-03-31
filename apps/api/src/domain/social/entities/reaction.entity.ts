import { randomUUID } from 'crypto';
import { ReactionEmoji } from '../value-objects/reaction-emoji.vo';

export interface ReactionProps {
  id: string;
  userId: string;
  workoutId: string;
  emoji: ReactionEmoji;
  createdAt: Date;
}

export class Reaction {
  private readonly props: ReactionProps;

  private constructor(props: ReactionProps) {
    this.props = props;
  }

  static create(userId: string, workoutId: string, emoji: ReactionEmoji): Reaction {
    return new Reaction({
      id: randomUUID(),
      userId,
      workoutId,
      emoji,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ReactionProps): Reaction {
    return new Reaction(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get workoutId(): string { return this.props.workoutId; }
  get emoji(): ReactionEmoji { return this.props.emoji; }
  get createdAt(): Date { return this.props.createdAt; }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      workoutId: this.props.workoutId,
      emoji: this.props.emoji.value,
      createdAt: this.props.createdAt,
    };
  }
}
