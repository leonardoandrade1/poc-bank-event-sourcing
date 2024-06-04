import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { logLevel } from '@nestjs/microservices/external/kafka.interface';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    TypeOrmModule.forFeature([BaseEventModel, TransactionModel]),
    ClientsModule.registerAsync({
      clients: [
        {
          imports: [ConfigModule],
          inject: [ConfigService],
          name: KAFKA_PROVIDER,
          useFactory: async (configService: ConfigService) => {
            return {
              transport: Transport.KAFKA,
              options: {
                run: {
                  autoCommit: false,
                },
                client: {
                  logLevel:
                    process.env.NODE_ENV === 'test'
                      ? logLevel.NOTHING
                      : undefined,
                  clientId: configService.get(
                    'KAFKA_BANK_MODULE_CLIENT_ID',
                    '',
                  ),
                  brokers: [configService.get('KAFKA_BROKER')],
                },
                consumer: {
                  groupId: configService.get('KAFKA_BANK_MODULE_GROUP_ID', ''),
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
