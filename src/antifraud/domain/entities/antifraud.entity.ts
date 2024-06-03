import { AntifraudEntity } from 'src/antifraud/infra/repositories/typeorm/entities/antifraud.entity';

export enum AntifraudType {
  ACCOUNT = 'ACCOUNT',
  TRANSFER = 'TRANSFER',
}

export enum AnalysisStatus {
  IN_ANALYSIS = 'IN_ANALYSIS',
  APPROVED = 'APPROVED',
  REPROVED = 'REPROVED',
}

export class Antifraud {
  private _id: string;
  private _type: AntifraudType;
  private _status: AnalysisStatus;
  private _reason: string;
  private _analyzedAt: Date;
  private _payload: Record<string, any>;

  private constructor(id: string) {
    this._id = id;
  }

  private static GenerateAccountCreationId(
    documentNumber: string,
    accountBranch: string,
    accountNumber: string,
  ): string {
    return `ACCOUNT#DOCUMENT_NUMBER#${documentNumber}#BRANCH#${accountBranch}#ACCOUNT_NUMBER#${accountNumber}`;
  }

  public static CreateAccountCreation(
    documentNumber: string,
    accountBranch: string,
    accountNumber: string,
  ): Antifraud {
    const antifraudId = this.GenerateAccountCreationId(
      documentNumber,
      accountBranch,
      accountNumber,
    );
    const antifraud = new Antifraud(antifraudId);
    antifraud._type = AntifraudType.ACCOUNT;
    antifraud._status = AnalysisStatus.IN_ANALYSIS;
    antifraud._payload = {
      documentNumber,
      accountBranch,
      accountNumber,
      createdAt: new Date().toISOString(),
    };
    return antifraud;
  }

  public static FromModel(model: AntifraudEntity): Antifraud {
    const antifraud = new Antifraud(model.antifraudId);
    antifraud._type = model.antifraudType;
    antifraud._status = model.status;
    antifraud._reason = model.reason;
    antifraud._analyzedAt = model.analyzedAt;
    antifraud._payload = model.payload;
    return antifraud;
  }

  public runAnalysis(): void {
    switch (this._type) {
      case AntifraudType.ACCOUNT:
        this.analyzeAccount();
        break;
      default:
        throw 'antifraud type not implemented';
    }
  }

  private reprove(reason: string): void {
    this._status = AnalysisStatus.REPROVED;
    this._reason = reason;
    this._analyzedAt = new Date();
  }

  private approve(): void {
    this._status = AnalysisStatus.APPROVED;
    this._reason = '';
    this._analyzedAt = new Date();
  }

  private analyzeAccount(): void {
    const shouldApprove = parseInt(this._payload.documentNumber) % 2 === 0;
    if (!shouldApprove) {
      this.reprove('Reproved by compliance rules');
      return;
    }
    this.approve();
    return;
  }

  public get id(): string {
    return this._id;
  }

  public get type(): AntifraudType {
    return this._type;
  }

  public get status(): AnalysisStatus {
    return this._status;
  }

  public get reason(): string {
    return this._reason;
  }

  public get analyzedAt(): Date {
    return this._analyzedAt;
  }

  public get payload(): Record<string, any> {
    return this._payload;
  }
}
