import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { BankAccountModule } from '../src/bank-account/bank-account.module';
import TransferMoneyScenario from './e2e-scenarios/transfer-money.scenario';
import { ConfigModule } from '@nestjs/config';
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka';

describe('TransferController (e2e)', () => {
  jest.setTimeout(240_000);
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let kafkaContainer: StartedKafkaContainer;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();
    kafkaContainer = await new KafkaContainer().withExposedPorts(9093).start();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({
              KAFKA_BROKER: `localhost:${kafkaContainer.getMappedPort(9093)}`,
              KAFKA_BANK_MODULE_CLIENT_ID: 'bank-account-client-id',
              KAFKA_BANK_MODULE_GROUP_ID: 'bank-account-group-id',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: postgresContainer.getConnectionUri(),
          autoLoadEntities: true,
          synchronize: true,
        }),
        BankAccountModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
    await kafkaContainer.stop();
  });

  it('create accounts and transfer money between them -> /transfer (POST)', async () => {
    await TransferMoneyScenario(app).happyPath();
  });

  it('throw 404 error trying to transfer when sender account does not exist -> /transfer (POST)', async () => {
    await TransferMoneyScenario(app).transferWhenSenderAccountDoesNotExist();
  });

  it('throw 404 error trying to transfer when receiver account does not exist -> /transfer (POST)', async () => {
    await TransferMoneyScenario(app).transferWhenReceiverAccountDoesNotExist();
  });

  it('create accounts and transfer money between them -> /transfer (POST)', async () => {
    await TransferMoneyScenario(
      app,
    ).transferWhenTransferValueIsBiggerThanAccountBalance();
  });
});
