import { BaseEvent } from 'src/bank-account/domain/events/base.event';
import { LessThan, Repository } from 'typeorm';
import { BaseEventEntity } from './typeorm/entities/base-event.entity';

export abstract class EventStoreBaseRepository {
  constructor(private readonly eventRepository: Repository<BaseEventEntity>) {}

  protected async saveOne<T extends BaseEvent>(event: T): Promise<void> {
    const eventEntity = BaseEventEntity.CreateFromEvent(event);
    await this.eventRepository.save(eventEntity);
  }

  protected async saveMany<T extends BaseEvent>(event: T[]): Promise<void> {
    const eventEntities = BaseEventEntity.CreateFromEvents(event);
    await this.eventRepository.save(eventEntities);
  }

  protected async fetchAllEvents(
    aggregateId: string,
    aggregateVersion?: number,
  ): Promise<BaseEvent[]> {
    const version = aggregateVersion ?? 100_000_000;

    const events = await this.eventRepository.find({
      where: {
        aggregateId,
        aggregateVersion: LessThan(version),
      },
    });

    return events as unknown as Array<BaseEvent>;
  }
}
