import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export default function DepositAndWithdrawSameAmountScenario(
  app: INestApplication<any>,
) {
  return {
    happyPath: async () => runHappyPath(app),
    withdrawAccountNotExist: async () => runWithdrawAccountNotExist(app),
    withdrawValueMoreThanAccountBalance: async () =>
      runWithdrawValueMoreThanAccountBalance(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;

  // Creating account
  const { body: responseCreateAccountBody, statusCode: createAccStatusCode } =
    await request(app.getHttpServer())
      .post('/document')
      .set('Content-Type', 'application/json')
      .send({
        documentNumber,
      });
  accountNumber = responseCreateAccountBody.account;
  accountBranch = responseCreateAccountBody.branch;
  expect(createAccStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // withdraw money
  const { body: responseWithdrawAccountBody, statusCode: withdrawStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/withdraw`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
      });

  expect(withdrawStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseWithdrawAccountBody.transactionId).toBeDefined();

  // Fetch account and checking balance
  const { body: responseGetAccountBody, statusCode } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  expect(statusCode).toEqual(HttpStatus.OK);
  expect(responseGetAccountBody.account).toEqual(accountNumber);
  expect(responseGetAccountBody.branch).toEqual(accountBranch);
  expect(responseGetAccountBody.document).toEqual(documentNumber);
  expect(responseGetAccountBody.balance).toEqual(0);
}

async function runWithdrawAccountNotExist(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;

  // Creating account
  const { body: responseCreateAccountBody, statusCode: createAccStatusCode } =
    await request(app.getHttpServer())
      .post('/document')
      .set('Content-Type', 'application/json')
      .send({
        documentNumber,
      });
  accountNumber = responseCreateAccountBody.account;
  accountBranch = responseCreateAccountBody.branch;
  expect(createAccStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // withdraw money
  const { body: responseWithdrawAccountBody, statusCode: withdrawStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/xpto0${accountBranch}/account/xyz1${accountNumber}/withdraw`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
      });

  expect(withdrawStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseWithdrawAccountBody.message.toLowerCase()).toEqual(
    'account not found',
  );
}

async function runWithdrawValueMoreThanAccountBalance(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;

  // Creating account
  const { body: responseCreateAccountBody, statusCode: createAccStatusCode } =
    await request(app.getHttpServer())
      .post('/document')
      .set('Content-Type', 'application/json')
      .send({
        documentNumber,
      });
  accountNumber = responseCreateAccountBody.account;
  accountBranch = responseCreateAccountBody.branch;
  expect(createAccStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // withdraw money
  const { body: responseWithdrawAccountBody, statusCode: withdrawStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/withdraw`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount + 1,
      });

  expect(withdrawStatusCode).toEqual(HttpStatus.BAD_REQUEST);
  expect(responseWithdrawAccountBody.message.toLowerCase()).toEqual(
    'cannot withdraw value more than current balance',
  );
}
