import { BaseEvent } from 'src/bank-account/domain/events/base.event';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['aggregateId', 'aggregateVersion'])
export class BaseEventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  aggregateId: string;

  @Column()
  aggregateVersion: number;

  @Column({ type: 'varchar' })
  eventName: string;

  @Column()
  created: Date;

  @Column({ type: 'json' })
  state: object;

  static CreateFromEvent<T extends BaseEvent>(event: T): BaseEventEntity {
    const baseEventEntity = new BaseEventEntity();
    baseEventEntity.aggregateId = event.aggregateId;
    baseEventEntity.aggregateVersion = event.aggregateVersion;
    baseEventEntity.eventName = event.eventName;
    baseEventEntity.created = event.created;
    baseEventEntity.state = event.state;
    return baseEventEntity;
  }

  static CreateFromEvents<T extends BaseEvent>(
    events: T[],
  ): Array<BaseEventEntity> {
    return events.map(BaseEventEntity.CreateFromEvent);
  }
}
