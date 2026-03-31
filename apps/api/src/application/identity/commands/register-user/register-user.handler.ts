import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/identity/repositories/i-user.repository';
import { User } from '@domain/identity/entities/user.entity';
import { Email } from '@domain/identity/value-objects/email.vo';
import { HashedPassword } from '@domain/identity/value-objects/password.vo';
import { Username } from '@domain/identity/value-objects/username.vo';
import {
  EmailAlreadyTakenException,
  UsernameAlreadyTakenException,
} from '@domain/identity/errors/identity.errors';
import { UserRegisteredEvent } from '@domain/identity/events/user-registered.event';

export interface RegisterUserResult {
  userId: string;
}

@Injectable()
export class RegisterUserHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = Email.create(command.email);
    const username = Username.create(command.username);

    // Fail fast — verificar unicidade antes de hash (operação cara)
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(email.toString()),
      this.userRepository.findByUsername(username.toString()),
    ]);

    if (existingEmail) throw new EmailAlreadyTakenException(email.toString());
    if (existingUsername) throw new UsernameAlreadyTakenException(username.toString());

    const passwordHash = await HashedPassword.fromPlainText(command.password);

    const user = User.create({
      email,
      username,
      passwordHash,
      displayName: command.displayName.trim(),
    });

    await this.userRepository.save(user);

    // TODO: publicar evento via EventBus (NotificationWorker enviará e-mail de boas-vindas)
    const _event = new UserRegisteredEvent(
      user.id,
      user.email.toString(),
      user.username.toString(),
    );

    return { userId: user.id };
  }
}
