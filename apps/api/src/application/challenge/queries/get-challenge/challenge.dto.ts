import { ChallengeStatus } from '@domain/challenge/entities/challenge.entity';

export interface ChallengeDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: ChallengeStatus;
  participantCount: number;
  createdById: string;
  isParticipating: boolean;
  isOwner: boolean;
  createdAt: string;
}
