import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository } from '@domain/identity/repositories/i-user.repository';
import { User, UserRole } from '@domain/identity/entities/user.entity';
import { Email } from '@domain/identity/value-objects/email.vo';
import { HashedPassword } from '@domain/identity/value-objects/password.vo';
import { Username } from '@domain/identity/value-objects/username.vo';
import type { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = user.toJSON();
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      update: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        role: data.role,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(record: PrismaUser): User {
    return User.reconstitute({
      id: record.id,
      email: Email.reconstitute(record.email),
      username: Username.reconstitute(record.username),
      passwordHash: record.passwordHash
        ? HashedPassword.fromHash(record.passwordHash)
        : null,
      displayName: record.displayName,
      avatarUrl: record.avatarUrl,
      bio: record.bio,
      role: record.role as UserRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
