import {
  AnalysisStatus,
  Antifraud,
  AntifraudType,
} from 'src/antifraud/domain/entities/antifraud.entity';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['antifraudId'])
export class AntifraudEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  antifraudId: string;

  @Column()
  antifraudType: AntifraudType;

  @Column()
  status: AnalysisStatus;

  @Column({ nullable: true, type: 'varchar' })
  reason: string;

  @Column()
  analyzedAt: Date;

  @Column({ type: 'json' })
  payload: object;

  static CreateFromModel(model: Antifraud): AntifraudEntity {
    const entity = new AntifraudEntity();
    entity.antifraudId = model.id;
    entity.antifraudType = model.type;
    entity.status = model.status;
    entity.reason = model.status;
    entity.analyzedAt = model.analyzedAt;
    entity.payload = model.payload;
    return entity;
  }
}
