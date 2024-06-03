import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCreationDTO } from './dto/account-creation.dto';
import { CommandBus } from '@nestjs/cqrs';
import { AccountCreationCommand } from 'src/antifraud/domain/command/account-creation.command';

@ApiTags('Antifraud')
@Controller('account-creation-analysis')
export class AntifraudAccountCreationAnalysisController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async accountCreation(@Body() body: AccountCreationDTO) {
    const accountCreationResult = await this.commandBus.execute<
      AccountCreationCommand,
      unknown
    >(
      new AccountCreationCommand(
        body.accountBranch,
        body.accountNumber,
        body.documentNumber,
      ),
    );
    return accountCreationResult;
  }
}
