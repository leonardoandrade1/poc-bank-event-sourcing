import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AntifraudEntity } from './typeorm/entities/antifraud.entity';
import { Repository } from 'typeorm';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';

@Injectable()
export class AntifraudRepository {
  constructor(
    @InjectRepository(AntifraudEntity)
    private readonly antifraudRepository: Repository<AntifraudEntity>,
  ) {}

  async save(antifraud: Antifraud): Promise<void> {
    const model = AntifraudEntity.CreateFromModel(antifraud);
    await this.antifraudRepository.save(model);
  }

  async fetchByAntifraudId(antifraudId: string): Promise<Antifraud> {
    const model = await this.antifraudRepository.findOne({
      where: {
        antifraudId,
      },
    });
    return Antifraud.FromModel(model);
  }
}
