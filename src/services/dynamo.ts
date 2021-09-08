import { DataMapper, QueryOptions } from '@aws/dynamodb-data-mapper';
import { AndExpression, ConditionExpression } from '@aws/dynamodb-expressions';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import moment from 'moment';
import config from '../config';
import { History, HistoryElement } from '../models/history';

type Options = DynamoDB.DocumentClient.DocumentClientOptions &
  ServiceConfigurationOptions &
  DynamoDB.ClientApiVersions;

const params: Options = {
  region: config.AWS_REGION,
  apiVersion: '2012-08-10',
};

if (process.env.stage === 'local') {
  params.region = 'localhost';
  params.endpoint = 'http://localhost:8000';
}

export const mapper = new DataMapper({
  client: new DynamoDB(params),
});

export const dynamoGetLatestHistory = async () => {
  const queryOptions: QueryOptions = {
    limit: 1,
    scanIndexForward: false,
  };

  const params: ConditionExpression = {
    type: 'Equals',
    subject: 'type',
    object: 'history',
  };
  const iterator = mapper.query(History, params, queryOptions);
  for await (const history of iterator) {
    // Return the first element
    return history;
  }
};

// Kind of a workaround for https://github.com/awslabs/dynamodb-data-mapper-js/issues/136
type FullHistory = Required<Omit<History, 'type' | 'created_at'>>;

export const dynamoSetHistory = async ({
  timestamp,
  count,
  songs,
}: FullHistory) => {
  const newHistory: History = Object.assign(new History(), {
    timestamp,
    count,
    songs,
  });
  return mapper.put(newHistory);
};

export const dynamoGetWeeklyHistory = async () => {
  // For comparison, the timestamp needs to be an ISO string just like the
  // timestamp from the model
  const timestamp = moment().subtract(1, 'week').toISOString();

  const dateFilter: ConditionExpression = {
    type: 'GreaterThanOrEqualTo',
    subject: 'timestamp',
    object: timestamp,
  };

  const filters: AndExpression = {
    type: 'And',
    conditions: [
      { type: 'Equals', subject: 'type', object: 'history' },
      dateFilter,
    ],
  };

  const items: History[] = [];

  for await (const history of mapper.query(History, filters)) {
    items.push(history);
  }

  // Only return the songs from each history
  return items.reduce((acc, curr) => {
    if (curr.songs) {
      acc.push(...curr.songs);
    }
    return acc;
  }, <HistoryElement[]>[]);
};
