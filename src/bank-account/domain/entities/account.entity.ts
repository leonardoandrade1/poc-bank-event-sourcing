import { BadRequestException } from '@nestjs/common';
import { AggregateRoot } from 'src/bank-account/common/domain/aggregate-root';
import { AccountStatus } from '../enums/account-status.enum';
import { AccountWasCreated } from '../events/account-was-created.event';
import { AccountWasDisabled } from '../events/account-was-disabled.event';
import { BaseEvent } from '../events/base.event';
import { DepositWasCreated } from '../events/deposit-was-created.event';
import { WithdrawWasCreated } from '../events/withdraw-was-created.event';
import { Transaction } from './transaction.entity';

export class Account extends AggregateRoot {
  private _branch: string;
  private _account: string;
  private _balance: number;
  private _document: string;
  private _status: AccountStatus;
  public readonly _transactions: Array<Transaction> = [];

  private constructor(aggregateId?: string) {
    super();
    this.setAggreateId(aggregateId);
  }

  public static GenerateAggregateId(
    accountNumber: string,
    accountBranch: string,
  ): string {
    return `BRANCH#${accountBranch}#ACCOUNT_NUMBER#${accountNumber}`;
  }

  public static GenerateNew(): Account {
    return new Account();
  }

  public static Create(
    documentNumber: string,
    accountNumber: string,
    accountBranch: string,
  ): Account {
    const aggregateId = this.GenerateAggregateId(accountNumber, accountBranch);
    const account = new Account(aggregateId);

    const accountWasCreated = new AccountWasCreated(
      aggregateId,
      account.version,
      documentNumber,
      accountNumber,
      accountBranch,
    );

    account.raiseEvent(accountWasCreated);
    return account;
  }

  isDisabled(): boolean {
    return this.status === AccountStatus.DISABLED;
  }

  deposit(
    amount: number,
    description: string,
    transactionId?: string,
  ): Transaction {
    if (amount <= 0)
      throw new BadRequestException('A deposit should has a positive value');
    const transaction = Transaction.StartDeposit(
      this.id,
      amount,
      description,
      transactionId,
    );
    const depositWasCreated = new DepositWasCreated(
      this.id,
      this.version,
      transaction,
    );

    this.raiseEvent(depositWasCreated);
    return transaction;
  }

  withdraw(amount: number, description?: string): Transaction {
    if (this.balance < amount)
      throw new BadRequestException(
        'Cannot withdraw value more than current balance',
      );
    const transaction = Transaction.StartWithdraw(
      this.id,
      undefined,
      amount,
      description,
    );
    const withdrawWasCreated = new WithdrawWasCreated(
      this.id,
      this.version,
      transaction,
    );
    this.raiseEvent(withdrawWasCreated);
    return transaction;
  }

  disable(): void {
    if (this.isDisabled())
      throw new BadRequestException(
        'Cannot disable account that is already disabled',
      );
    const accountWasDisabled = new AccountWasDisabled(this.id, this.version);
    this.raiseEvent(accountWasDisabled);
  }

  protected apply(event: BaseEvent<object>) {
    switch (event.eventName) {
      case AccountWasCreated.EventName:
        this.applyAccountWasCreatedEvent(event as AccountWasCreated);
        break;
      case DepositWasCreated.EventName:
        this.applyDepositWasCreatedEvent(event as DepositWasCreated);
        break;
      case WithdrawWasCreated.EventName:
        this.applyWithdrawWasCreatedEvent(event as WithdrawWasCreated);
        break;
      case AccountWasDisabled.EventName:
        this.applyAccountWasDisabledEvent(event as AccountWasDisabled);
        break;

      default:
        throw 'event apply not implemented';
    }
  }

  public get account(): string {
    return this._account;
  }

  public get branch(): string {
    return this._branch;
  }

  public get balance(): number {
    return this._balance;
  }

  public get document(): string {
    return this._document;
  }

  public get status(): AccountStatus {
    return this._status;
  }

  private set status(newStatus: AccountStatus) {
    this._status = newStatus;
  }

  private applyAccountWasCreatedEvent(event: AccountWasCreated): void {
    this.id = event.aggregateId;
    this.version = event.aggregateVersion;
    this.created = event.created;
    this._document = event.state.documentNumber;
    this._account = event.state.number;
    this._branch = event.state.branch;
    this._balance = event.state.balance;
    this._status = event.state.status;
  }

  private applyDepositWasCreatedEvent(event: DepositWasCreated): void {
    const transaction = Transaction.Restore(
      this.id,
      event.state.transaction.transactionId,
      event.state.transaction.status,
      event.state.transaction.amount,
      event.state.transaction.description,
      event.state.transaction.created,
    );
    this._transactions.push(transaction);
    this._balance = this.balance + transaction.amount;
  }

  private applyWithdrawWasCreatedEvent(event: WithdrawWasCreated): void {
    const transaction = Transaction.Restore(
      this.id,
      event.state.transaction.transactionId,
      event.state.transaction.status,
      event.state.transaction.amount,
      event.state.transaction.description,
      event.state.transaction.created,
    );
    this._transactions.push(transaction);
    this._balance = this.balance - transaction.amount;
  }

  private applyAccountWasDisabledEvent(event: AccountWasDisabled): void {
    this.status = event.state.status;
  }
}
