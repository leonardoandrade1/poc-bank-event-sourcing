import { HttpStatus, INestApplication } from '@nestjs/common';
import { AccountStatus } from 'src/bank-account/domain/enums/account-status.enum';
import request from 'supertest';

export default function DisableAccountScenario(app: INestApplication<any>) {
  return {
    happyPath: async () => runHappyPath(app),
    disableAccountThatDoesNotExist: async () =>
      runDisableAccountThatDoesNotExist(app),
    disableAccountAlreadyDisabled: async () =>
      runDisableAccountAlreadyDisabled(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  // Create account
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;
  let accountStatus = undefined;
  const response = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });

  const responseBody = response.body;
  accountNumber = responseBody.account;
  accountBranch = responseBody.branch;
  accountStatus = responseBody.status;
  expect(response.statusCode).toEqual(HttpStatus.ACCEPTED);
  expect(accountNumber).toBeDefined();
  expect(accountBranch).toBeDefined();
  expect(accountStatus).toEqual(AccountStatus.IN_ANALYSIS);

  // Disable account
  const { statusCode: disableStatusCode } = await request(app.getHttpServer())
    .patch(
      `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/disable`,
    )
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  expect(disableStatusCode).toEqual(HttpStatus.ACCEPTED);

  // Fetch current account status
  const { body: responseGetAccountBody, statusCode } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  expect(statusCode).toEqual(HttpStatus.OK);
  expect(responseGetAccountBody.status).toEqual(AccountStatus.DISABLED);
}

async function runDisableAccountThatDoesNotExist(app: INestApplication<any>) {
  // Create account
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;
  let accountStatus = undefined;
  const response = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });

  const responseBody = response.body;
  accountNumber = responseBody.account;
  accountBranch = responseBody.branch;
  accountStatus = responseBody.status;
  expect(response.statusCode).toEqual(HttpStatus.ACCEPTED);
  expect(accountNumber).toBeDefined();
  expect(accountBranch).toBeDefined();
  expect(accountStatus).toEqual(AccountStatus.IN_ANALYSIS);

  // Trying to disable account again
  const {
    body: responseDisableAccNotExistBody,
    statusCode: disableAccNotExistStatusCode,
  } = await request(app.getHttpServer())
    .patch(
      `/document/${documentNumber}/branch/xpto${accountBranch}/account/xyz${accountNumber}/disable`,
    )
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  expect(disableAccNotExistStatusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseDisableAccNotExistBody.message.toLowerCase()).toEqual(
    'account not found',
  );
}

async function runDisableAccountAlreadyDisabled(app: INestApplication<any>) {
  // Create account
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;
  let accountStatus = undefined;
  const response = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });

  const responseBody = response.body;
  accountNumber = responseBody.account;
  accountBranch = responseBody.branch;
  accountStatus = responseBody.status;
  expect(response.statusCode).toEqual(HttpStatus.ACCEPTED);
  expect(accountNumber).toBeDefined();
  expect(accountBranch).toBeDefined();
  expect(accountStatus).toEqual(AccountStatus.IN_ANALYSIS);

  // Disable account
  const { statusCode: disableStatusCode } = await request(app.getHttpServer())
    .patch(
      `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/disable`,
    )
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  expect(disableStatusCode).toEqual(HttpStatus.ACCEPTED);

  // Trying to disable account again
  const { body: responseDisableTwiceBody, statusCode: disableTwiceStatusCode } =
    await request(app.getHttpServer())
      .patch(
        `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}/disable`,
      )
      .set('Content-Type', 'application/json')
      .send({
        documentNumber,
      });
  expect(disableTwiceStatusCode).toEqual(HttpStatus.BAD_REQUEST);
  expect(responseDisableTwiceBody.message.toLowerCase()).toEqual(
    'cannot disable account that is already disabled',
  );
}
