export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly requesterId: string,
  ) {}
}
