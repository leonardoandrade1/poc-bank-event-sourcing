export abstract class BaseEvent<T extends object = object> {
  created: Date;
  aggregateId: string;
  aggregateVersion: number;
  state: T;

  abstract eventName: string;

  constructor(aggregateId: string, aggregateVersion: number, state: T) {
    this.created = new Date();
    this.aggregateId = aggregateId;
    this.aggregateVersion = aggregateVersion;
    this.state = state;
  }
}
