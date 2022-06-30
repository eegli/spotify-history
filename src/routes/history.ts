import { QueryOptions } from '@aws/dynamodb-data-mapper';
import { AndExpression, ConditionExpression } from '@aws/dynamodb-expressions';
import moment from 'moment';
import { defaults } from '../config';
import { DynamoHistoryElement } from '../config/types';
import { History, HistoryRequired } from '../models/history';
import { dynamoDataMapper } from '../services/dynamo';

const params: ConditionExpression = {
  type: 'Equals',
  subject: 'type',
  object: 'history',
};
export const dynamoGetLatestHistory = async () => {
  const queryOptions: QueryOptions = {
    limit: 1,
    scanIndexForward: false,
  };

  const iterator = dynamoDataMapper.query(History, params, queryOptions);
  for await (const history of iterator) {
    // Return the first element
    return history;
  }
};

export const dynamoSetHistory = async ({
  timestamp,
  songs,
}: HistoryRequired) => {
  const newHistory: History = Object.assign(new History(), {
    timestamp,
    songs,
  });
  return dynamoDataMapper.put(newHistory);
};

export const dynamoGetHistoryRange = async () => {
  // For comparison, the timestamp needs to be an ISO string just like
  // the timestamp from the model
  const timestamp = moment()
    .subtract(...defaults.backupRange)
    .toISOString();

  const dateFilter: ConditionExpression = {
    type: 'GreaterThanOrEqualTo',
    subject: 'timestamp',
    object: timestamp,
  };

  const filters: AndExpression = {
    type: 'And',
    conditions: [params, dateFilter],
  };

  const items: History[] = [];

  const iterator = dynamoDataMapper.query(History, filters);

  for await (const history of iterator) {
    items.push(history);
  }

  // Reduce the history to only get the songs
  return items.reduce((acc, curr) => {
    if (curr.songs) {
      acc.push(...curr.songs);
    }
    return acc;
  }, <DynamoHistoryElement[]>[]);
};
