import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import { CustomType } from '@aws/dynamodb-data-marshaller';
import { AttributeValue } from 'aws-sdk/clients/dynamodb';
import config from '../config';

// Define the properties of a song that is eventually saved to Dynamo
export interface HistoryElement {
  name: string;
  id: string;
  playedAt: string;
  artists: {
    artistName: string;
    artistId: string;
    genres: string;
  }[];
}

// Store dates as ISO strings
const ISOdateType: CustomType<Date> = {
  type: 'Custom',
  marshall: (input: Date): AttributeValue => ({ S: input.toISOString() }),
  unmarshall: (persistedValue: AttributeValue): Date =>
    new Date(persistedValue.S!),
};

@table(config.AWS_TABLE_NAME)
export class History {
  @hashKey({ defaultProvider: () => 'history' })
  type?: string;

  /* Date of the last song that was listened to */
  @rangeKey(ISOdateType)
  timestamp?: Date;

  /* Date of when the songs were scrobbed */
  @attribute({
    ...ISOdateType,
    defaultProvider: () => new Date(),
  })
  created_at?: Date;

  /* Number of songs */
  @attribute()
  count?: number;

  /* Actual songs */
  @attribute()
  songs?: HistoryElement[];
}
