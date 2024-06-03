import { LessThan, Repository } from 'typeorm';
import { BaseEventModel } from './typeorm/entities/base-event.entity';
import { BaseEvent } from 'src/bank-account/common/domain/base.event';

export abstract class EventStoreBaseRepository {
  constructor(private readonly eventRepository: Repository<BaseEventModel>) {}

  protected async saveOne<T extends BaseEvent>(event: T): Promise<void> {
    const model = BaseEventModel.CreateFromEvent(event);
    await this.eventRepository.save(model);
  }

  protected async saveMany<T extends BaseEvent>(event: T[]): Promise<void> {
    const models = BaseEventModel.CreateFromEvents(event);
    await this.eventRepository.save(models);
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
