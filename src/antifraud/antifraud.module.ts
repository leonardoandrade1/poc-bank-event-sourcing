import { Module } from '@nestjs/common';
import { AntifraudAccountCreationAnalysisController } from './infra/http/account-creation-analysis/account-creation-analysis.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/handlers';

@Module({
  imports: [CqrsModule.forRoot()],
  controllers: [AntifraudAccountCreationAnalysisController],
  providers: [...CommandHandlers],
})
export class AntifraudModule {}
