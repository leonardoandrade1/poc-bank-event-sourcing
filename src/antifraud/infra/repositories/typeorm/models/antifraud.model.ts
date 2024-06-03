import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';
import { AnalysisStatus, AntifraudType } from 'src/antifraud/domain/enums';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['antifraudId'])
export class AntifraudModel {
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

  static CreateFromEntity(entity: Antifraud): AntifraudModel {
    const model = new AntifraudModel();
    model.antifraudId = entity.id;
    model.antifraudType = entity.type;
    model.status = entity.status;
    model.reason = entity.reason;
    model.analyzedAt = entity.analyzedAt;
    model.payload = entity.payload;
    return model;
  }
}
