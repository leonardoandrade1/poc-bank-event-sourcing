import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './infra/http/accounts/account.controller';
import { AccountEventStoreRepository } from './infra/repositories/account-event-store.repository';
import { BaseEventEntity } from './infra/repositories/typeorm/entities/base-event.entity';
import { TransferController } from './infra/http/transfers/transfer.controller';
import {
  EventPublisher,
  IEventPublisher,
  LoggerEventPublisher,
} from './infra/publisher/base-event-publisher';
import { TransactionEntity } from './infra/repositories/typeorm/entities/transaction.entity';
import { TransactionRepository } from './infra/repositories/transaction.repository';
import { TransactionsController } from './infra/http/transactions/transactions.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/handlers/commands';
import { QueryHandlers } from './application/handlers/queries';

@Module({
  imports: [
    CqrsModule.forRoot(),
    TypeOrmModule.forFeature([BaseEventEntity, TransactionEntity]),
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
