import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka';
import { BankAccountModule } from '../src/bank-account/bank-account.module';
import CreateAccountScenario from './e2e-scenarios/create-account.scenario';
import CreateAndWaitAccountBeActiveScenario from './e2e-scenarios/create-and-wait-account-be-active.scenario';
import DepositAndWithdrawSameAmountScenario from './e2e-scenarios/deposit-and-withdraw-same-amount.scenario';
import DepositMoneyScenario from './e2e-scenarios/deposit-money.scenario';
import DisableAccountScenario from './e2e-scenarios/disable-account.scenario';
import { ConfigModule } from '@nestjs/config';

describe('AccountController (e2e)', () => {
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

  describe('create account', () => {
    it('create account -> /document/ (POST)', async () => {
      await CreateAccountScenario(app);
    });
  });

  describe('create and fetch account', () => {
    it('create and wait for account to be active -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber} (GET)', async () => {
      await CreateAndWaitAccountBeActiveScenario(app).happyPath();
    });

    it('return 404 error trying to fetch account that does not exists -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber} (GET)', async () => {
      await CreateAndWaitAccountBeActiveScenario(app).accountDoesNotExist();
    });
  });

  describe('deposit money', () => {
    it('deposit money in new account -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/deposit (POST)', async () => {
      await DepositMoneyScenario(app).happyPath();
    });

    it('return 404 error trying to deposit money in account that does not exist -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/deposit (POST)', async () => {
      await DepositMoneyScenario(app).depositIntoNonExistentAccount();
    });
  });

  describe('withdraw', () => {
    it('deposit money and withdraw the same amount in new account -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/withdraw (POST)', async () => {
      await DepositAndWithdrawSameAmountScenario(app).happyPath();
    });

    it('return 404 error trying to deposit money and withdraw in account that does not exist -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/withdraw (POST)', async () => {
      await DepositAndWithdrawSameAmountScenario(app).withdrawAccountNotExist();
    });

    it('return 400 trying to deposit money and withdraw value more than account balance -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/withdraw (POST)', async () => {
      await DepositAndWithdrawSameAmountScenario(
        app,
      ).withdrawValueMoreThanAccountBalance();
    });
  });

  describe('disable account', () => {
    it('disable IN_ANALYSIS account -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/disable (PATCH)', async () => {
      await DisableAccountScenario(app).happyPath();
    });
    it.todo(
      'disable ACTIVE account -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/disable (PATCH)',
    );
    it('return 404 trying to disable account that does not exist -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/disable (PATCH)', async () => {
      await DisableAccountScenario(app).disableAccountThatDoesNotExist();
    });
    it('return 400 trying to disable account that already disabled -> /document/{documentNumber}/branch/{accountBranch}/account/{accountNumber}/disable (PATCH)', async () => {
      await DisableAccountScenario(app).disableAccountAlreadyDisabled();
    });
  });
});
