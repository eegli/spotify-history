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

@table(config.TABLE_NAME)
export class History {
  @hashKey({ defaultProvider: () => 'history' })
  type?: string;

  @rangeKey()
  timestamp?: string;

  @attribute()
  date?: string;

  @attribute()
  count?: number;

  @attribute()
  songs?: HistoryElement[];
}
