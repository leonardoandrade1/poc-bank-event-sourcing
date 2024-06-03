import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AntifraudModule } from 'src/antifraud/antifraud.module';
import AntifraudAccountCreationScenario from './e2e-scenarios/antifraud-account-creation.scenario';

describe('AntifraudAccountCreationController (e2e)', () => {
  let app: INestApplication;
  // let postgresContainer: StartedPostgreSqlContainer;

  // beforeAll(async () => {
  //   postgresContainer = await new PostgreSqlContainer().start();
  // }, 60000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   url: postgresContainer.getConnectionUri(),
        //   autoLoadEntities: true,
        //   synchronize: true,
        // }),
        AntifraudModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  // afterAll(async () => {
  //   await app.close();
  //   await postgresContainer.stop();
  // });

  it('return account creation approved -> /account-creation-analysis (POST)', async () => {
    await AntifraudAccountCreationScenario(app).happyPath();
  });

  it('return account creation reproved -> /account-creation-analysis (POST)', async () => {
    await AntifraudAccountCreationScenario(
      app,
    ).reproveAccountWhenDocumentNumberIsOdd();
  });

  it('return previous account creation approved when check antifraud twice -> /account-creation-analysis (POST)', async () => {
    await AntifraudAccountCreationScenario(
      app,
    ).returnPreviousApprovedAnalysisResultForSameAccount();
  });

  it('return previous account creation reproved when check antifraud twice -> /account-creation-analysis (POST)', async () => {
    await AntifraudAccountCreationScenario(
      app,
    ).returnPreviousReprovedAnalysisResultForSameAccount();
  });
});
