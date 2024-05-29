import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export default function TransferMoneyScenario(app: INestApplication<any>) {
  return {
    happyPath: async () => runHappyPath(app),
    transferWhenSenderAccountDoesNotExist: async () =>
      runTransferWhenSenderAccountDoesNotExist(app),
    transferWhenReceiverAccountDoesNotExist: async () =>
      runTransferWhenReceiverAccountDoesNotExists(app),
    transferWhenTransferValueIsBiggerThanAccountBalance: async () =>
      runTryingToSendValueBiggerThanAccountBalance(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  const fromAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };
  const toAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account that will transfer money
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  fromAccount.documentNumber = responseCreateFirstAccountBody.document;
  fromAccount.account = responseCreateFirstAccountBody.account;
  fromAccount.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Creating account that will receive transfer
  const {
    body: responseCreateSecondAccountBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  toAccount.documentNumber = responseCreateSecondAccountBody.document;
  toAccount.account = responseCreateSecondAccountBody.account;
  toAccount.branch = responseCreateSecondAccountBody.branch;
  expect(createSecondStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateSecondAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // transfer money
  const { body: responseTransferBody, statusCode: transferStatusCode } =
    await request(app.getHttpServer())
      .post(`/transfer`)
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
        sender: {
          documentNumber: fromAccount.documentNumber,
          branch: fromAccount.branch,
          account: fromAccount.account,
        },
        receiver: {
          documentNumber: toAccount.documentNumber,
          branch: toAccount.branch,
          account: toAccount.account,
        },
      });

  expect(transferStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseTransferBody.transactionId).toBeDefined();

  // Fetch account that transfered money and checking balance
  const { body: responseGetFirstAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  expect(responseGetFirstAccountBody.account).toEqual(fromAccount.account);
  expect(responseGetFirstAccountBody.branch).toEqual(fromAccount.branch);
  expect(responseGetFirstAccountBody.document).toEqual(
    fromAccount.documentNumber,
  );
  expect(responseGetFirstAccountBody.balance).toEqual(0);

  // Fetch account that received transfer money and checking balance
  const { body: responseGetSecondAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${toAccount.documentNumber}/branch/${toAccount.branch}/account/${toAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  //checking sender account
  expect(responseGetFirstAccountBody.balance).toEqual(0);
  //checking receiver account
  expect(responseGetSecondAccountBody.balance).toEqual(depositAmount);
}

async function runTransferWhenSenderAccountDoesNotExist(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const fromAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account that will transfer money
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  fromAccount.documentNumber = responseCreateFirstAccountBody.document;
  fromAccount.account = responseCreateFirstAccountBody.account;
  fromAccount.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // transfer money
  const { body: responseTransferBody, statusCode: transferStatusCode } =
    await request(app.getHttpServer())
      .post(`/transfer`)
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
        sender: {
          documentNumber: fromAccount.documentNumber,
          branch: `xpto${fromAccount.branch}`,
          account: `xyz${fromAccount.account}`,
        },
        receiver: {
          documentNumber: fromAccount.documentNumber,
          branch: `xpto${fromAccount.branch}`,
          account: `xyz${fromAccount.account}`,
        },
      });

  expect(transferStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseTransferBody.message.toLowerCase()).toEqual(
    'sender account not found',
  );

  // Fetch account that tried to transfer money and checking balance
  const { body: responseGetFirstAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  expect(responseGetFirstAccountBody.account).toEqual(fromAccount.account);
  expect(responseGetFirstAccountBody.branch).toEqual(fromAccount.branch);
  expect(responseGetFirstAccountBody.document).toEqual(
    fromAccount.documentNumber,
  );
  expect(responseGetFirstAccountBody.balance).toEqual(depositAmount);
}

async function runTransferWhenReceiverAccountDoesNotExists(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const fromAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };
  const toAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account that will transfer money
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  fromAccount.documentNumber = responseCreateFirstAccountBody.document;
  fromAccount.account = responseCreateFirstAccountBody.account;
  fromAccount.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Creating account that will receive transfer
  const {
    body: responseCreateSecondAccountBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  toAccount.documentNumber = responseCreateSecondAccountBody.document;
  toAccount.account = responseCreateSecondAccountBody.account;
  toAccount.branch = responseCreateSecondAccountBody.branch;
  expect(createSecondStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateSecondAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // transfer money
  const { body: responseTransferBody, statusCode: transferStatusCode } =
    await request(app.getHttpServer())
      .post(`/transfer`)
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
        sender: {
          documentNumber: fromAccount.documentNumber,
          branch: fromAccount.branch,
          account: fromAccount.account,
        },
        receiver: {
          documentNumber: fromAccount.documentNumber,
          branch: `xpto${fromAccount.branch}`,
          account: `xyz${fromAccount.account}`,
        },
      });

  expect(transferStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseTransferBody.message.toLowerCase()).toEqual(
    'receiver account not found',
  );

  // Fetch account that transfered money and checking balance
  const { body: responseGetFirstAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  // Fetch account that received transfer money and checking balance
  const { body: responseGetSecondAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${toAccount.documentNumber}/branch/${toAccount.branch}/account/${toAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  //checking sender account
  expect(responseGetFirstAccountBody.balance).toEqual(depositAmount);
  //checking receiver account
  expect(responseGetSecondAccountBody.balance).toEqual(0);
}

async function runTryingToSendValueBiggerThanAccountBalance(
  app: INestApplication<any>,
) {
  const documentNumber = '53486705024';
  const fromAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };
  const toAccount = {
    account: undefined,
    branch: undefined,
    documentNumber: undefined,
  };

  // Creating account that will transfer money
  const {
    body: responseCreateFirstAccountBody,
    statusCode: createFirstStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  fromAccount.documentNumber = responseCreateFirstAccountBody.document;
  fromAccount.account = responseCreateFirstAccountBody.account;
  fromAccount.branch = responseCreateFirstAccountBody.branch;
  expect(createFirstStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateFirstAccountBody.balance).toEqual(0);

  // Creating account that will receive transfer
  const {
    body: responseCreateSecondAccountBody,
    statusCode: createSecondStatusCode,
  } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  toAccount.documentNumber = responseCreateSecondAccountBody.document;
  toAccount.account = responseCreateSecondAccountBody.account;
  toAccount.branch = responseCreateSecondAccountBody.branch;
  expect(createSecondStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseCreateSecondAccountBody.balance).toEqual(0);

  // Depositing money
  const depositAmount = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  const { body: responseDepositAccountBody, statusCode: depositStatusCode } =
    await request(app.getHttpServer())
      .post(
        `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}/deposit`,
      )
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount,
        description: faker.finance.transactionDescription(),
      });

  expect(depositStatusCode).toEqual(HttpStatus.ACCEPTED);
  expect(responseDepositAccountBody.transactionId).toBeDefined();

  // transfer money
  const { body: responseTransferBody, statusCode: transferStatusCode } =
    await request(app.getHttpServer())
      .post(`/transfer`)
      .set('Content-Type', 'application/json')
      .send({
        amount: depositAmount + 1,
        description: faker.finance.transactionDescription(),
        sender: {
          documentNumber: fromAccount.documentNumber,
          branch: fromAccount.branch,
          account: fromAccount.account,
        },
        receiver: {
          documentNumber: toAccount.documentNumber,
          branch: toAccount.branch,
          account: toAccount.account,
        },
      });

  expect(transferStatusCode).toEqual(HttpStatus.BAD_REQUEST);
  expect(responseTransferBody.message.toLowerCase()).toEqual(
    'cannot withdraw value more than current balance',
  );

  // Fetch account that transfered money and checking balance
  const { body: responseGetFirstAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${fromAccount.documentNumber}/branch/${fromAccount.branch}/account/${fromAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  // Fetch account that received transfer money and checking balance
  const { body: responseGetSecondAccountBody } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${toAccount.documentNumber}/branch/${toAccount.branch}/account/${toAccount.account}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  //checking sender account
  expect(responseGetFirstAccountBody.balance).toEqual(depositAmount);
  //checking receiver account
  expect(responseGetSecondAccountBody.balance).toEqual(0);
}
