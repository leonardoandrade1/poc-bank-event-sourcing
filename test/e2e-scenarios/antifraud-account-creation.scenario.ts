import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
    });
  accountDetails.documentNumber = responseAntifraudAccCreationBody.document;
  accountDetails.account = responseAntifraudAccCreationBody.account;
  accountDetails.branch = responseAntifraudAccCreationBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual('Approved');
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
    });
  accountDetails.documentNumber = responseAntifraudAccCreationBody.document;
  accountDetails.account = responseAntifraudAccCreationBody.account;
  accountDetails.branch = responseAntifraudAccCreationBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual('Reproved');
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
  const { statusCode: createFirstStatusCode } = await request(
    app.getHttpServer(),
  )
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountDetails.documentNumber = responseAntifraudAccCreationBody.document;
  accountDetails.account = responseAntifraudAccCreationBody.account;
  accountDetails.branch = responseAntifraudAccCreationBody.branch;
  expect(createSecondStatusCode).toEqual(HttpStatus.NOT_MODIFIED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual('Approved');
  expect(responseAntifraudAccCreationBody.reason).toEqual('');
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
  const { statusCode: createFirstStatusCode } = await request(
    app.getHttpServer(),
  )
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/account-creation-analysis')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountDetails.documentNumber = responseAntifraudAccCreationBody.document;
  accountDetails.account = responseAntifraudAccCreationBody.account;
  accountDetails.branch = responseAntifraudAccCreationBody.branch;
  expect(createSecondStatusCode).toEqual(HttpStatus.NOT_MODIFIED);
  expect(responseAntifraudAccCreationBody.accountNumber).toEqual(
    accountDetails.account,
  );
  expect(responseAntifraudAccCreationBody.status).toEqual('Reproved');
  expect(responseAntifraudAccCreationBody.reason).not.toEqual('');
}
