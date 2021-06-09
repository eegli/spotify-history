import config from '../config';

import { DataMapper, QueryOptions } from '@aws/dynamodb-data-mapper';
import { ConditionExpression, AndExpression } from '@aws/dynamodb-expressions';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { localDS } from '../utils/date';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { History } from '../models/history';
import { KeyConditions } from 'aws-sdk/clients/dynamodb';
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

export const getLatest = async (timeStamp: string) => {
  const queryOptions: QueryOptions = {
    limit: 1,
    scanIndexForward: false,
  };

  const dateFilter: ConditionExpression = {
    type: 'LessThanOrEqualTo',
    subject: 'timestamp',
    object: timeStamp,
  };

  const params: AndExpression = {
    type: 'And',
    conditions: [
      { type: 'Equals', subject: 'type', object: 'chapter' },
      dateFilter,
    ],
  };

  for await (const foo of mapper.query(History, params, queryOptions)) {
    console.log(foo.data);
  }
};

/* export const updateDateRef = async (timeStamp: number) => {
  const params: DynamoItem = {
    TableName: config.TABLE_NAME,
    Item: {
      dateId: config.masterDateRef,
      lastPlayed: timeStamp,
      lastPlayedString: localDS(timeStamp),
    },
  };
  return client.put(params).promise();
};
 */
