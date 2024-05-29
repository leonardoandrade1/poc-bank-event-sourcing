import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export default function TransactionScenario(app: INestApplication<any>) {
  return {
    fetchAllTransactions: async () => runFetchAllTransactions(app),
    fetchAccountWithNoTransaction: async () =>
      runFetchAccountWithNoTransaction(app),
    fetchTransationDetailByTransactionId: async () =>
      runFetchTransationDetailByTransactionId(app),
    tryingToFetchTransacitonThatDoesNotExist: async () =>
      runTryingToFetchTransacitonThatDoesNotExist(app),
    tryingfetchTransactionThatDoesNotBelongToAccount: async () =>
      runTryingfetchTransactionThatDoesNotBelongToAccount(app),
  };
}

async function runFetchAllTransactions(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  const accountData = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountData.documentNumber = responseCreateFirstAccountBody.document;
  accountData.account = responseCreateFirstAccountBody.account;
  accountData.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const depositDescription = faker.finance.transactionDescription();
  let transactionId = undefined;
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${accountData.documentNumber}/branch/${accountData.branch}/account/${accountData.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: depositDescription,
      });
  transactionId = responseDepositAccountBody.transactionId;
  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(transactionId).toBeDefined();

  // Fetch all account transactions
  const {
    body: responseFetchTransactionsBody,
    statusCode: transactionDetailStatusCode,
  } = await request(app.getHttpServer())
    .get(
      `/transactions/branch/${accountData.branch}/account/${accountData.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  //Checking transaction data
  expect(transactionDetailStatusCode).toEqual(HttpStatus.OK);
  expect(responseFetchTransactionsBody).toHaveLength(1);
}

async function runFetchAccountWithNoTransaction(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  const accountData = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountData.documentNumber = responseCreateFirstAccountBody.document;
  accountData.account = responseCreateFirstAccountBody.account;
  accountData.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Fetch transaction detail by deposit transactionId
  const {
    body: responseFetchTransactionsBody,
    statusCode: transactionDetailStatusCode,
  } = await request(app.getHttpServer())
    .get(
      `/transactions/branch/${accountData.branch}/account/${accountData.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  //Checking transaction data
  expect(transactionDetailStatusCode).toEqual(HttpStatus.NO_CONTENT);
  expect(responseFetchTransactionsBody).toEqual({});
}

async function runFetchTransationDetailByTransactionId(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const accountData = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountData.documentNumber = responseCreateFirstAccountBody.document;
  accountData.account = responseCreateFirstAccountBody.account;
  accountData.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const depositDescription = faker.finance.transactionDescription();
  let transactionId = undefined;
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${accountData.documentNumber}/branch/${accountData.branch}/account/${accountData.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: depositDescription,
      });
  transactionId = responseDepositAccountBody.transactionId;
  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(transactionId).toBeDefined();

  // Fetch transaction detail by deposit transactionId
  const {
    body: responseTransactionDetailBody,
    statusCode: transactionDetailStatusCode,
  } = await request(app.getHttpServer())
    .get(
      `/transactions/branch/${accountData.branch}/account/${accountData.account}/transaction/${transactionId}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  //Checking transaction data
  expect(transactionDetailStatusCode).toEqual(HttpStatus.OK);
  expect(responseTransactionDetailBody.transactionId).toEqual(transactionId);
  expect(responseTransactionDetailBody.description).toEqual(depositDescription);
  expect(responseTransactionDetailBody.amount).toEqual(depositAmount);
}

async function runTryingToFetchTransacitonThatDoesNotExist(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const accountData = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountData.documentNumber = responseCreateFirstAccountBody.document;
  accountData.account = responseCreateFirstAccountBody.account;
  accountData.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Fetch transaction using unexistent transactionId
  const transactionId = 'transaction-xpto-123-xyz';
  const {
    body: responseTransactionDetailBody,
    statusCode: transactionDetailStatusCode,
  } = await request(app.getHttpServer())
    .get(
      `/transactions/branch/${accountData.branch}/account/${accountData.account}/transaction/${transactionId}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  //Checking transaction data
  expect(transactionDetailStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseTransactionDetailBody.message.toLowerCase()).toEqual(
    'transaction not found',
  );
}

async function runTryingfetchTransactionThatDoesNotBelongToAccount(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const accountData = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountData.documentNumber = responseCreateFirstAccountBody.document;
  accountData.account = responseCreateFirstAccountBody.account;
  accountData.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  let transactionId = undefined;
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${accountData.documentNumber}/branch/${accountData.branch}/account/${accountData.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });
  transactionId = responseDepositAccountBody.transactionId;
  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(transactionId).toBeDefined();

  // Fetch transaction detail by deposit transactionId
  const {
    body: responseTransactionDetailBody,
    statusCode: transactionDetailStatusCode,
  } = await request(app.getHttpServer())
    .get(
      `/transactions/branch/xpto${accountData.branch}/account/${accountData.account}/transaction/${transactionId}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  //Checking transaction data
  expect(transactionDetailStatusCode).toEqual(HttpStatus.BAD_REQUEST);
  expect(responseTransactionDetailBody.message.toLowerCase()).toEqual(
    'cannot get transactions that belongs to another account',
  );
}
