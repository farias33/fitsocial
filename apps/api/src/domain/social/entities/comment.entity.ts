import { randomUUID } from 'crypto';
import { CommentUnauthorizedException, CommentTooLongException } from '../errors/social.errors';

const MAX_BODY_LENGTH = 500;

export interface CommentProps {
  id: string;
  userId: string;
  workoutId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private readonly props: CommentProps;

  private constructor(props: CommentProps) {
    this.props = props;
  }

  static create(userId: string, workoutId: string, body: string): Comment {
    const trimmed = body.trim();
    if (trimmed.length > MAX_BODY_LENGTH) throw new CommentTooLongException();
    return new Comment({
      id: randomUUID(),
      userId,
      workoutId,
      body: trimmed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get workoutId(): string { return this.props.workoutId; }
  get body(): string { return this.props.body; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  assertOwnership(userId: string): void {
    if (!this.isOwnedBy(userId)) throw new CommentUnauthorizedException();
  }

  edit(newBody: string, requesterId: string): void {
    this.assertOwnership(requesterId);
    const trimmed = newBody.trim();
    if (trimmed.length > MAX_BODY_LENGTH) throw new CommentTooLongException();
    this.props.body = trimmed;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      workoutId: this.props.workoutId,
      body: this.props.body,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
