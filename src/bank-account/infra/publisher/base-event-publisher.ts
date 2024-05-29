import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseEvent } from 'src/bank-account/domain/events/base.event';

export interface IEventPublisher {
  publish(events: BaseEvent): Promise<void>;
}
export const IEventPublisher = Symbol('IEventPublisher');

@Injectable()
export class EventPublisher {
  constructor(
    @Inject(IEventPublisher) private readonly publisher: IEventPublisher,
  ) {}

  async publish(...events: BaseEvent[]): Promise<void> {
    const publishPromise = events.map((event) => this.publisher.publish(event));
    await Promise.all(publishPromise);
  }
}

@Injectable()
export class LoggerEventPublisher implements IEventPublisher {
  async publish(event: BaseEvent<object>): Promise<void> {
    const message = `Event ${event.eventName} from aggregate ${event.aggregateId} v${event.aggregateVersion} published`;
    Logger.log(message, LoggerEventPublisher.name);
    return;
  }
}
