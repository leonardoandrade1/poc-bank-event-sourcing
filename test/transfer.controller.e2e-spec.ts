import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { BankAccountModule } from '../src/bank-account/bank-account.module';
import TransferMoneyScenario from './e2e-scenarios/transfer-money.scenario';

describe('TransferController (e2e)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();
  }, 60000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
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
