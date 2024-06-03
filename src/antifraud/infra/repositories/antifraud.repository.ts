import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AntifraudModel } from './typeorm/models/antifraud.model';
import { Repository } from 'typeorm';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';

@Injectable()
export class AntifraudRepository {
  constructor(
    @InjectRepository(AntifraudModel)
    private readonly antifraudRepository: Repository<AntifraudModel>,
  ) {}

  async save(antifraud: Antifraud): Promise<void> {
    const model = AntifraudModel.CreateFromEntity(antifraud);
    await this.antifraudRepository.save(model);
  }

  async fetchByAntifraudId(antifraudId: string): Promise<Antifraud> {
    const model = await this.antifraudRepository.findOne({
      where: {
        antifraudId,
      },
    });
    if (!model) return undefined;
    return Antifraud.FromModel(model);
  }
}
