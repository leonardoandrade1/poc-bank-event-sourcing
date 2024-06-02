import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { FetchAccountByBranchAndNumberQuery } from 'src/bank-account/domain/queries/account/fetch-account-from-by-and-number.query';
import { AccountEventStoreRepository } from 'src/bank-account/infra/repositories/account-event-store.repository';

@QueryHandler(FetchAccountByBranchAndNumberQuery)
export class FetchAccountByBranchAndNumberHandler
  implements IQueryHandler<FetchAccountByBranchAndNumberQuery>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
  ) {}

  async execute(query: FetchAccountByBranchAndNumberQuery): Promise<Account> {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        query.accountBranch,
        query.accountNumber,
      );
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }
}
