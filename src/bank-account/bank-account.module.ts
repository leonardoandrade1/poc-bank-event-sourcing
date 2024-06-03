import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './infra/http/accounts/account.controller';
import { AccountEventStoreRepository } from './infra/repositories/account-event-store.repository';
import { BaseEventModel } from './infra/repositories/typeorm/models/base-event.model';
import { TransferController } from './infra/http/transfers/transfer.controller';
import {
  EventPublisher,
  IEventPublisher,
  LoggerEventPublisher,
} from './infra/publisher/base-event-publisher';
import { TransactionModel } from './infra/repositories/typeorm/models/transaction.model';
import { TransactionRepository } from './infra/repositories/transaction.repository';
import { TransactionsController } from './infra/http/transactions/transactions.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/handlers/commands';
import { QueryHandlers } from './application/handlers/queries';

@Module({
  imports: [
    CqrsModule.forRoot(),
    TypeOrmModule.forFeature([BaseEventModel, TransactionModel]),
  ],
  controllers: [AccountController, TransferController, TransactionsController],
  providers: [
    AccountEventStoreRepository,
    TransactionRepository,
    EventPublisher,
    {
      provide: IEventPublisher,
      useClass: LoggerEventPublisher,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class BankAccountModule {}
