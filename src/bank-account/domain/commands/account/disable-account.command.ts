export class DisableAccountCommand {
  constructor(
    readonly documentNumber: string,
    readonly branch: string,
    readonly account: string,
  ) {}
}
