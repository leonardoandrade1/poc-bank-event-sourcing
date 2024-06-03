import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AnalysisStatus } from 'src/antifraud/domain/enums';
import request from 'supertest';

export default function AntifraudTransferMoneyScenario(
  app: INestApplication<any>,
) {
  return {
    happyPath: async () => runHappyPath(app),
    reproveAccountWhenDocumentNumberReceiverIsOdd: async () =>
      runReproveAccountWhenDocumentNumberReceiverIsOdd(app),
    returnPreviousApprovedAnalysisResultForSameTransferId: async () =>
      runReturnPreviousApprovedAnalysisResultForSameTransferId(app),
    returnPreviousReprovedAnalysisResultForSameTransferId: async () =>
      runReturnPreviousReprovedAnalysisResultForSameTransferId(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  const documentNumber1 = '53486705024';
  const documentNumber2 = '84721605056';
  const transferMoneyAnalysisDto = {
    transactionId: faker.string.uuid(),
    amount: parseFloat(faker.finance.amount({ min: 1, max: 1000 })),
    sender: {
      documentNumber: documentNumber1,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
    receiver: {
      documentNumber: documentNumber2,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
  };

  // Check transfer money
  const {
    body: responseAntifraudTransferMoneyBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudTransferMoneyBody.transaction.transactionId).toEqual(
    transferMoneyAnalysisDto.transactionId,
  );
  expect(responseAntifraudTransferMoneyBody.status).toEqual(
    AnalysisStatus.APPROVED,
  );
  expect(responseAntifraudTransferMoneyBody.reason).toEqual('');
}

async function runReproveAccountWhenDocumentNumberReceiverIsOdd(
  app: INestApplication<any>,
) {
  const documentNumber1 = '53486705024';
  const documentNumber2 = '84721605055';
  const transferMoneyAnalysisDto = {
    transactionId: faker.string.uuid(),
    amount: parseFloat(faker.finance.amount({ min: 1, max: 1000 })),
    sender: {
      documentNumber: documentNumber1,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
    receiver: {
      documentNumber: documentNumber2,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
  };

  // Check transfer money
  const {
    body: responseAntifraudTransferMoneyBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseAntifraudTransferMoneyBody.transaction.transactionId).toEqual(
    transferMoneyAnalysisDto.transactionId,
  );
  expect(responseAntifraudTransferMoneyBody.status).toEqual(
    AnalysisStatus.REPROVED,
  );
  expect(responseAntifraudTransferMoneyBody.reason).not.toEqual('');
}

async function runReturnPreviousApprovedAnalysisResultForSameTransferId(
  app: INestApplication<any>,
) {
  const documentNumber1 = '53486705024';
  const documentNumber2 = '84721605056';
  const transferMoneyAnalysisDto = {
    transactionId: faker.string.uuid(),
    amount: parseFloat(faker.finance.amount({ min: 1, max: 1000 })),
    sender: {
      documentNumber: documentNumber1,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
    receiver: {
      documentNumber: documentNumber2,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
  };

  // Check transfer money
  const {
    body: responseFirstAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseSecondAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createSecondStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseFirstAntifraudAccCreationBody.analyzedAt).toEqual(
    responseSecondAntifraudAccCreationBody.analyzedAt,
  );
  expect(
    responseFirstAntifraudAccCreationBody.transaction.transactionId,
  ).toEqual(responseSecondAntifraudAccCreationBody.transaction.transactionId);
  expect(responseSecondAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.APPROVED,
  );
  expect(responseSecondAntifraudAccCreationBody.reason).toEqual('');
}

async function runReturnPreviousReprovedAnalysisResultForSameTransferId(
  app: INestApplication<any>,
) {
  const documentNumber1 = '53486705024';
  const documentNumber2 = '84721605055';
  const transferMoneyAnalysisDto = {
    transactionId: faker.string.uuid(),
    amount: parseFloat(faker.finance.amount({ min: 1, max: 1000 })),
    sender: {
      documentNumber: documentNumber1,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
    receiver: {
      documentNumber: documentNumber2,
      branch: faker.finance.accountNumber(4),
      account: faker.finance.accountNumber(6),
    },
  };

  // Check transfer money
  const {
    body: responseFirstAntifraudAccCreationBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createFirstStatusCode).toEqual(HttpStatus.CREATED);
  const {
    body: responseSecondAntifraudAccCreationBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/transfer-analysis')
    .set('Content-Type', 'application/json')
    .send(transferMoneyAnalysisDto);
  expect(createSecondStatusCode).toEqual(HttpStatus.CREATED);
  expect(responseFirstAntifraudAccCreationBody.analyzedAt).toEqual(
    responseSecondAntifraudAccCreationBody.analyzedAt,
  );
  expect(
    responseFirstAntifraudAccCreationBody.transaction.transactionId,
  ).toEqual(responseSecondAntifraudAccCreationBody.transaction.transactionId);
  expect(responseSecondAntifraudAccCreationBody.status).toEqual(
    AnalysisStatus.REPROVED,
  );
  expect(responseSecondAntifraudAccCreationBody.reason).not.toEqual('');
}
