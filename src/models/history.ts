import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import { CustomType } from '@aws/dynamodb-data-marshaller';
import { AttributeValue } from 'aws-sdk/clients/dynamodb';
import dayjs from 'dayjs';
import config, { defaults } from '../config';
import { DynamoHistoryElement } from '../config/types';

// Kind of a workaround for
// https://github.com/awslabs/dynamodb-data-mapper-js/issues/136
export type HistoryRequired = Required<
  Omit<History, 'type' | 'created_at' | 'expire_at'>
>;

// Store dates as ISO strings.

// Note that for the TTL attribute, this decorator cannot be applied
// as it needs to be stored as a Number data type.
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-before-you-start.html#time-to-live-ttl-before-you-start-formatting
//
const ISOdateType: CustomType<Date> = {
  type: 'Custom',
  marshall: (input: Date): AttributeValue => ({ S: input.toISOString() }),
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  unmarshall: (persistedValue: AttributeValue): Date =>
    new Date(persistedValue.S!),
  /* eslint-enable */
};

@table(config.AWS_TABLE_NAME)
export class History {
  @hashKey({ defaultProvider: () => 'history' })
  type?: string;

  /* Songs expire after 30 days by default */
  @attribute({
    defaultProvider: () =>
      dayjs()
        .add(...defaults.dynamoExpireAfter)
        .toDate(),
  })
  expire_at?: Date;

  /* Date of the last song that was listened to */
  @rangeKey(ISOdateType)
  timestamp?: Date;

  /* Date of when the songs were scrobbled */
  @attribute({
    ...ISOdateType,
    defaultProvider: () => new Date(),
  })
  created_at?: Date;

  /* Actual songs */
  @attribute()
  songs?: DynamoHistoryElement[];
}
