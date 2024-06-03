import { Module } from '@nestjs/common';
import { BankAccountModule } from './bank-account/bank-account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntifraudModule } from './antifraud/antifraud.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('ORM_LOCALHOST'),
          port: +configService.get('ORM_PORT'),
          username: configService.get('ORM_USERNAME'),
          password: configService.get('ORM_PASSWORD'),
          database: configService.get('ORM_DBNAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    BankAccountModule,
    AntifraudModule,
  ],
})
export class AppModule {}
