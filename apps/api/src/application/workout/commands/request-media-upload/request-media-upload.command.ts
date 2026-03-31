export class RequestMediaUploadCommand {
  constructor(
    public readonly workoutId: string,
    public readonly requesterId: string,
    public readonly contentType: string,
  ) {}
}
