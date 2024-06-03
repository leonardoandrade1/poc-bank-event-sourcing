import { BaseEvent } from 'src/common/domain/base.event';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['aggregateId', 'aggregateVersion'])
export class BaseEventModel {
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

  static CreateFromEvent<T extends BaseEvent>(event: T): BaseEventModel {
    const model = new BaseEventModel();
    model.aggregateId = event.aggregateId;
    model.aggregateVersion = event.aggregateVersion;
    model.eventName = event.eventName;
    model.created = event.created;
    model.state = event.state;
    return model;
  }

  static CreateFromEvents<T extends BaseEvent>(
    events: T[],
  ): Array<BaseEventModel> {
    return events.map(BaseEventModel.CreateFromEvent);
  }
}
