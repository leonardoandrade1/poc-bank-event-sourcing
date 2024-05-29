import crypto from 'node:crypto';
import { BaseEvent } from 'src/bank-account/domain/events/base.event';

export abstract class AggregateRoot {
  public id: string;
  public created: Date;
  public updated: Date;
  public version: number = 0;
  private uncommitedEvents: Array<BaseEvent>;

  constructor() {
    this.uncommitedEvents = [];
    this.created = new Date();
  }

  protected abstract apply(event: BaseEvent);

  protected upVersion(): void {
    this.version = this.version + 1;
  }

  protected raiseEvent(event: BaseEvent): void {
    this.upVersion();
    event.aggregateVersion = this.version;
    event.aggregateId = this.id;

    this.uncommitedEvents.push(event);
    this.applyChange(event);
  }

  protected applyChange(event: BaseEvent): void {
    this.apply(event);
    this.version = event.aggregateVersion;
    this.updated = event.created;
  }

  public commitEvents(): void {
    this.uncommitedEvents = [];
  }

  public getUncommitedEvents(): Array<BaseEvent> {
    return this.uncommitedEvents;
  }

  public restoreFromHistory(events: Array<BaseEvent>): void {
    events.map((event) => this.applyChange(event));
  }

  setAggreateId(aggregateId?: string) {
    this.id = aggregateId ?? crypto.randomUUID();
  }
}
