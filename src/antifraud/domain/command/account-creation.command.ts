export class AccountCreationCommand {
  constructor(
    readonly accountBranch: string,
    readonly accountNumber: string,
    readonly documentNumber: string,
  ) {}
}
