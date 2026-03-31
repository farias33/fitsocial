export class JoinChallengeCommand {
  constructor(
    public readonly challengeId: string,
    public readonly userId: string,
  ) {}
}
