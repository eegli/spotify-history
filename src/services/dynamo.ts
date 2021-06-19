import config from '../config';

import { DataMapper, QueryOptions } from '@aws/dynamodb-data-mapper';
import { ConditionExpression } from '@aws/dynamodb-expressions';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
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

const mapper = new DataMapper({
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

export const dynamoSetHistory = async (
  timestamp: string,
  count: number,
  songs: HistoryElement[]
) => {
  const newHistory: History = Object.assign(new History(), {
    timestamp,
    count,
    songs,
  });

  return mapper.put(newHistory);
};
