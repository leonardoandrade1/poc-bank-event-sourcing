import { HttpStatus, INestApplication } from '@nestjs/common';
import { AccountStatus } from 'src/bank-account/domain/enums/account-status.enum';
import request from 'supertest';

export default async function CreateAccountScenario(
  app: INestApplication<any>,
) {
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
}
