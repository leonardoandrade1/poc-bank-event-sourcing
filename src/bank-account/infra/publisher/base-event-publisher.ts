import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IHeaders } from 'kafkajs';
import { AccountWasCreated } from 'src/bank-account/domain/events/account-was-created.event';
import { AccountWasDisabled } from 'src/bank-account/domain/events/account-was-disabled.event';
import { DepositWasCreated } from 'src/bank-account/domain/events/deposit-was-created.event';
import { TransferWasApproved } from 'src/bank-account/domain/events/transfer-was-approved.event';
import { TransferWasCreated } from 'src/bank-account/domain/events/transfer-was-created.event';
import { TransferWasDeposited } from 'src/bank-account/domain/events/transfer-was-deposited.event';
import { TransferWasReproved } from 'src/bank-account/domain/events/transfer-was-reproved.event';
import { WithdrawWasCreated } from 'src/bank-account/domain/events/withdraw-was-created.event';
import { BaseEvent } from 'src/common/domain/base.event';
import { KAFKA_PROVIDER } from 'src/common/provider.constants';

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

@Injectable()
export class KafkaEventPublisher implements IEventPublisher {
  private eventTopicMapping: Map<string, string> = new Map();
  constructor(
    @Inject(KAFKA_PROVIDER)
    private readonly kafka: ClientKafka,
  ) {
    this.eventTopicMapping.set(
      AccountWasCreated.EventName,
      'bank.account.created',
    );
    this.eventTopicMapping.set(
      AccountWasDisabled.EventName,
      'bank.account.disabled',
    );
    this.eventTopicMapping.set(
      DepositWasCreated.EventName,
      'bank.transaction.deposit',
    );
    this.eventTopicMapping.set(
      TransferWasCreated.EventName,
      'bank.transaction.transfer.created',
    );
    this.eventTopicMapping.set(
      TransferWasApproved.EventName,
      'bank.transaction.transfer.approved',
    );
    this.eventTopicMapping.set(
      TransferWasReproved.EventName,
      'bank.transaction.transfer.reproved',
    );
    this.eventTopicMapping.set(
      TransferWasDeposited.EventName,
      'bank.transaction.transfer.deposited',
    );
    this.eventTopicMapping.set(
      WithdrawWasCreated.EventName,
      'bank.transaction.withdraw.created',
    );
  }

  async publish(event: BaseEvent<object>): Promise<void> {
    const kafkaHeaders: IHeaders = {
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      aggregateVersion: event.aggregateVersion.toString(),
      createdAt: event.created.toISOString(),
    };
    const topicName =
      this.eventTopicMapping.get(event.eventName) ?? 'default.topic.kafka';
    const observable = await this.kafka.emit(topicName, {
      key: event.aggregateId,
      headers: kafkaHeaders,
      value: JSON.stringify(event),
    });
    const message = `Event ${event.eventName} from aggregate ${event.aggregateId} v${event.aggregateVersion} has been published on ${topicName}`;
    await observable.forEach(() => {
      Logger.debug(message, KafkaEventPublisher.name);
    });
  }
}
