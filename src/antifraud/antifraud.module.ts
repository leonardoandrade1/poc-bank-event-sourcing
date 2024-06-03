import { Module } from '@nestjs/common';
import { AntifraudAccountCreationAnalysisController } from './infra/http/account-creation-analysis/account-creation-analysis.controller';

@Module({
  controllers: [AntifraudAccountCreationAnalysisController],
  providers: [],
})
export class AntifraudModule {}
