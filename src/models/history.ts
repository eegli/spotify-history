import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import config from '../config';

// Define the properties of a song that is eventually saved to Dynamo
export interface HistoryElement {
  name: string;
  id: string;
  artists: {
    artistName: string;
    artistId: string;
    genres: string;
  }[];
}

@table(config.AWS_TABLE_NAME)
export class History {
  @hashKey({ defaultProvider: () => 'history' })
  type?: string;

  /* Unix timestamp of the last song that was scrobbed */
  @rangeKey()
  timestamp?: string;

  /* Date of when the songs were scrobbed */
  @attribute({
    type: 'String',
    defaultProvider: () => new Date().toISOString(),
  })
  created_at?: Date;

  /* Number of songs */
  @attribute()
  count?: number;

  /* Actual songs */
  @attribute()
  songs?: HistoryElement[];
}
