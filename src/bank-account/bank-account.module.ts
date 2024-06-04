import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KAFKA_PROVIDER } from 'src/common/provider.constants';
import { CommandHandlers } from './application/handlers/commands';
import { QueryHandlers } from './application/handlers/queries';
import { AccountController } from './infra/http/accounts/account.controller';
import { TransactionsController } from './infra/http/transactions/transactions.controller';
import { TransferController } from './infra/http/transfers/transfer.controller';
import {
  EventPublisher,
  IEventPublisher,
  KafkaEventPublisher,
} from './infra/publisher/base-event-publisher';
import { AccountEventStoreRepository } from './infra/repositories/account-event-store.repository';
import { TransactionRepository } from './infra/repositories/transaction.repository';
import { BaseEventModel } from './infra/repositories/typeorm/models/base-event.model';
import { TransactionModel } from './infra/repositories/typeorm/models/transaction.model';

@Module({
  imports: [
    CqrsModule.forRoot(),
    TypeOrmModule.forFeature([BaseEventModel, TransactionModel]),
    ClientsModule.registerAsync({
      clients: [
        {
          name: KAFKA_PROVIDER,
          useFactory: () => {
            return {
              transport: Transport.KAFKA,
              options: {
                run: {
                  autoCommit: false,
                },
                client: {
                  clientId: 'bank-account-module-clientId',
                  brokers: ['localhost:29092'],
                },
                consumer: {
                  groupId: 'bank-account-module-groupdId',
                },
                subscribe: {
                  fromBeginning: true,
                },
              },
            };
          },
        },
      ],
    }),
  ],
  controllers: [AccountController, TransferController, TransactionsController],
  providers: [
    AccountEventStoreRepository,
    TransactionRepository,
    EventPublisher,
    {
      provide: IEventPublisher,
      // useClass: LoggerEventPublisher,
      useClass: KafkaEventPublisher,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class BankAccountModule {}
