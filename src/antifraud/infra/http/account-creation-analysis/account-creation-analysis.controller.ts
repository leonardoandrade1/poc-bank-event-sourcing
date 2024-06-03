import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCreationDTO } from './dto/account-creation.dto';
import { CommandBus } from '@nestjs/cqrs';
import { AccountCreationCommand } from 'src/antifraud/domain/command/account-creation.command';
import { AntifraudAccountAnalysisDTO } from './dto/antifraud-account-analysis.dto';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';

@ApiTags('Antifraud')
@Controller('account-creation-analysis')
export class AntifraudAccountCreationAnalysisController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async accountCreation(@Body() body: AccountCreationDTO) {
    const accountCreationResult = await this.commandBus.execute<
      AccountCreationCommand,
      Antifraud
    >(
      new AccountCreationCommand(
        body.accountBranch,
        body.accountNumber,
        body.documentNumber,
      ),
    );
    const dto = AntifraudAccountAnalysisDTO.FromAntifraud(
      accountCreationResult,
    );
    return dto;
  }
}
