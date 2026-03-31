import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email.vo';
import { HashedPassword } from '../value-objects/password.vo';
import { Username } from '../value-objects/username.vo';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserProps {
  id: string;
  email: Email;
  username: Username;
  passwordHash: HashedPassword | null; // null para login via OAuth
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: Email;
  username: Username;
  passwordHash: HashedPassword | null;
  displayName: string;
}

export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(input: CreateUserInput): User {
    return new User({
      ...input,
      id: randomUUID(),
      avatarUrl: null,
      bio: null,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get username(): Username { return this.props.username; }
  get passwordHash(): HashedPassword | null { return this.props.passwordHash; }
  get displayName(): string { return this.props.displayName; }
  get avatarUrl(): string | null { return this.props.avatarUrl; }
  get bio(): string | null { return this.props.bio; }
  get role(): UserRole { return this.props.role; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ─── Comportamento de domínio ──────────────────────────────────────────────

  updateProfile(input: { displayName?: string; bio?: string }): void {
    if (input.displayName !== undefined) {
      this.props.displayName = input.displayName.trim();
    }
    if (input.bio !== undefined) {
      this.props.bio = input.bio.trim() || null;
    }
    this.props.updatedAt = new Date();
  }

  updateAvatar(url: string): void {
    this.props.avatarUrl = url;
    this.props.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email.toString(),
      username: this.props.username.toString(),
      passwordHash: this.props.passwordHash?.toString() ?? null,
      displayName: this.props.displayName,
      avatarUrl: this.props.avatarUrl,
      bio: this.props.bio,
      role: this.props.role,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
