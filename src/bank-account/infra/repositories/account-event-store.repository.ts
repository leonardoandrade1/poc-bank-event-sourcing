import { Injectable } from '@nestjs/common';
import { EventStoreBaseRepository } from './event-store-base.repository';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEventModel } from './typeorm/models/base-event.model';
import { EventPublisher } from '../publisher/base-event-publisher';

@Injectable()
export class AccountEventStoreRepository extends EventStoreBaseRepository {
  constructor(
    @InjectRepository(BaseEventModel)
    eventRepository: Repository<BaseEventModel>,
    private readonly eventPublisher: EventPublisher,
  ) {
    super(eventRepository);
  }

  async save(account: Account): Promise<void> {
    const events = account.getUncommitedEvents();
    await this.saveMany(events);
    await this.eventPublisher.publish(...events);
  }

  async getFromAccountBranchAndNumber(
    branch: string,
    accountNumber: string,
    version?: number,
  ): Promise<Account> {
    const aggregateId = Account.GenerateAggregateId(accountNumber, branch);
    const events = await this.fetchAllEvents(aggregateId, version);
    if (!events || !events.length) return undefined;
    const account = Account.GenerateNew();
    account.restoreFromHistory(events);

    return account;
  }

  async get(aggregateId: string, version?: number): Promise<Account> {
    const events = await this.fetchAllEvents(aggregateId, version);
    const account = Account.GenerateNew();
    account.restoreFromHistory(events);
    return account;
  }
}
