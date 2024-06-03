import { Module } from '@nestjs/common';
import { AntifraudAccountCreationAnalysisController } from './infra/http/account-creation-analysis/account-creation-analysis.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/handlers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntifraudModel } from './infra/repositories/typeorm/models/antifraud.model';
import { AntifraudRepository } from './infra/repositories/antifraud.repository';

@Module({
  imports: [CqrsModule.forRoot(), TypeOrmModule.forFeature([AntifraudModel])],
  controllers: [AntifraudAccountCreationAnalysisController],
  providers: [AntifraudRepository, ...CommandHandlers],
})
export class AntifraudModule {}
