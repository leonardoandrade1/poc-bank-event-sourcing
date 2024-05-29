import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { BankAccountModule } from '../src/bank-account/bank-account.module';
import TransactionScenario from './e2e-scenarios/transaction.scenario';

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

  it('fetch all transactions from account -> /transactions/branch/{accountBranch}/account/{accountNumber} (GET)', async () => {
    await TransactionScenario(app).fetchAllTransactions();
  });

  it('should return NO_CONTENT when account does not have any transaction -> /transactions/branch/{accountBranch}/account/{accountNumber}/transaction/{transactionId} (GET)', async () => {
    await TransactionScenario(app).fetchAccountWithNoTransaction();
  });

  it('fetch transaction detail by and transactionId -> /transactions/branch/{accountBranch}/account/{accountNumber}/transaction/{transactionId} (GET)', async () => {
    await TransactionScenario(app).fetchTransationDetailByTransactionId();
  });

  it('throw 404 transactionId does not exists -> /transactions/branch/{accountBranch}/account/{accountNumber}/transaction/{transactionId} (GET)', async () => {
    await TransactionScenario(app).tryingToFetchTransacitonThatDoesNotExist();
  });

  it('throw 400 when transactionId does not belong to the provided account -> /transactions/branch/{accountBranch}/account/{accountNumber}/transaction/{transactionId} (GET)', async () => {
    await TransactionScenario(
      app,
    ).tryingfetchTransactionThatDoesNotBelongToAccount();
  });
});
