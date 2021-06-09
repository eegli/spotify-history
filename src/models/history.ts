import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import config from '../config';

@table(config.TABLE_NAME)
export class History {
  @hashKey({ defaultProvider: () => 'history' })
  type?: string;

  @rangeKey({ defaultProvider: () => new Date() })
  timestamp?: Date;

  @attribute()
  data?: number;
}
