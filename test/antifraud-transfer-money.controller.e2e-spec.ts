import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AntifraudModule } from 'src/antifraud/antifraud.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import AntifraudTransferMoneyScenario from './e2e-scenarios/antifraud-transfer-money.scenario';

describe('AntifraudTransferMoneyController (e2e)', () => {
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
        AntifraudModule,
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

  it('return transfer money approved -> /transfer-analysis (POST)', async () => {
    await AntifraudTransferMoneyScenario(app).happyPath();
  });

  it('return transfer money reproved -> /transfer-analysis (POST)', async () => {
    await AntifraudTransferMoneyScenario(
      app,
    ).reproveAccountWhenDocumentNumberReceiverIsOdd();
  });

  it('return previous transfer money approved when check antifraud twice -> /transfer-analysis (POST)', async () => {
    await AntifraudTransferMoneyScenario(
      app,
    ).returnPreviousApprovedAnalysisResultForSameTransferId();
  });

  it('return previous transfer money reproved when check antifraud twice -> /transfer-analysis (POST)', async () => {
    await AntifraudTransferMoneyScenario(
      app,
    ).returnPreviousReprovedAnalysisResultForSameTransferId();
  });
});
