import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './interfaces/http/modules/identity.module';
import { ChallengeModule } from './interfaces/http/modules/challenge.module';
import { WorkoutModule } from './interfaces/http/modules/workout.module';
import { SocialModule } from './interfaces/http/modules/social.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    IdentityModule,
    ChallengeModule,
    WorkoutModule,
    SocialModule,
  ],
})
export class AppModule {}
