import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export default function DepositMoneyScenario(app: INestApplication<any>) {
  return {
    happyPath: async () => runHappyPath(app),
    depositIntoNonExistentAccount: async () =>
      runDepositIntoNonExistentAccount(app),
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
  expect(responseGetAccountBody.balance).toEqual(depositAmount);
}

async function runDepositIntoNonExistentAccount(app: INestApplication<any>) {
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
  accountNumber = `xpto-${responseCreateAccountBody.account}`;
  accountBranch = `xpto-${responseCreateAccountBody.branch}`;
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

  expect(depositStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseDepositAccountBody.message.toLowerCase()).toEqual(
    'account not found',
  );
}
