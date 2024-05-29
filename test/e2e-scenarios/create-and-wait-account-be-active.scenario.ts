import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export default function CreateAndWaitAccountBeActiveScenario(
  app: INestApplication<any>,
) {
  return {
    happyPath: async () => runHappyPath(app),
    accountDoesNotExist: async () => runAccountDoesNotExist(app),
  };
}

async function runHappyPath(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;
  const { body: responseCreateAccountBody } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountNumber = responseCreateAccountBody.account;
  accountBranch = responseCreateAccountBody.branch;

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
}

async function runAccountDoesNotExist(app: INestApplication<any>) {
  const documentNumber = '53486705024';
  let accountNumber = undefined;
  let accountBranch = undefined;
  const { body: responseCreateAccountBody } = await request(app.getHttpServer())
    .post('/document')
    .set('Content-Type', 'application/json')
    .send({
      documentNumber,
    });
  accountNumber = `xpto-${responseCreateAccountBody.account}`;
  accountBranch = `xpto-${responseCreateAccountBody.branch}`;

  const { body: responseGetAccountBody, statusCode } = await request(
    app.getHttpServer(),
  )
    .get(
      `/document/${documentNumber}/branch/${accountBranch}/account/${accountNumber}`,
    )
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  expect(statusCode).toEqual(HttpStatus.NOT_FOUND);
  expect(responseGetAccountBody.message.toLowerCase()).toEqual(
    'account not found',
  );
}
