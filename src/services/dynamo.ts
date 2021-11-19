import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import config from '../config';

type Options = DynamoDB.DocumentClient.DocumentClientOptions &
  ServiceConfigurationOptions &
  DynamoDB.ClientApiVersions;

const params: Options = {
  region: config.AWS_REGION,
  apiVersion: '2012-08-10',
};

// In local mode, Webpack sets NODE_ENV to 'development'
if (process.env.NODE_ENV === 'development') {
  params.region = 'localhost';
  params.endpoint = 'http://localhost:8000';
}

export const dynamoDataMapper = new DataMapper({
  client: new DynamoDB(params),
});
