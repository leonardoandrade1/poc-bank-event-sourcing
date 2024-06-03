import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AnalysisStatus } from 'src/antifraud/domain/enums';
import request from 'supertest';

export default function AntifraudAccountCreationScenario(
  app: INestApplication<any>,
) {
  return {
    happyPath: async () => runHappyPath(app),
    reproveAccountWhenDocumentNumberIsOdd: async () =>
      runReproveAccountWhenDocumentNumberIsOdd(app),
    returnPreviousApprovedAnalysisResultForSameAccount: async () =>
      runReturnPreviousApprovedAnalysisResultForSameAccount(app),
    returnPreviousReprovedAnalysisResultForSameAccount: async () =>
      runReturnPreviousReprovedAnalysisResultForSameAccount(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  const accountDetails = {
    account: faker.finance.accountNumber(6),
    branch: faker.finance.accountNumber(4),
    documentNumber,
  };

  // Check account creation
  const {
    body: responseAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.APPROVED,
  );
  expect(responseAntifraudAccCreationBody.reason).toEqual('');
}

async function runReproveAccountWhenDocumentNumberIsOdd(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705023';
  const accountDetails = {
    account: faker.finance.accountNumber(6),
    branch: faker.finance.accountNumber(4),
    documentNumber,
  };

  // Check account creation
  const {
    body: responseAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.REPROVED,
  );
  expect(responseAntifraudAccCreationBody.reason).not.toEqual('');
}

async function runReturnPreviousApprovedAnalysisResultForSameAccount(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const accountDetails = {
    account: faker.finance.accountNumber(6),
    branch: faker.finance.accountNumber(4),
    documentNumber,
  };

  // Check account creation
  const {
    body: responseFirstAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseSecondAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createSecondStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseFirstAntifraudAccCreationBody.analyzedAt).toEqual(
    responseSecondAntifraudAccCreationBody.analyzedAt,
  );
  expect(responseFirstAntifraudAccCreationBody.accountNumber).toEqual(
    responseSecondAntifraudAccCreationBody.accountNumber,
  );
  expect(responseSecondAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.APPROVED,
  );
  expect(responseSecondAntifraudAccCreationBody.reason).toEqual('');
}

async function runReturnPreviousReprovedAnalysisResultForSameAccount(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705023';
  const accountDetails = {
    account: faker.finance.accountNumber(6),
    branch: faker.finance.accountNumber(4),
    documentNumber,
  };

  // Check account creation
  const {
    body: responseFirstAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseSecondAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
      accountNumber: accountDetails.account,
      accountBranch: accountDetails.branch,
    });
  expect(createSecondStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseFirstAntifraudAccCreationBody.analyzedAt).toEqual(
    responseSecondAntifraudAccCreationBody.analyzedAt,
  );
  expect(responseFirstAntifraudAccCreationBody.accountNumber).toEqual(
    responseSecondAntifraudAccCreationBody.accountNumber,
  );
  expect(responseSecondAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.REPROVED,
  );
  expect(responseSecondAntifraudAccCreationBody.reason).not.toEqual('');
}
