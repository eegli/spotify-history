import config from '../config';

import AWS from 'aws-sdk';
import { localDS } from '../utils/date';
import { DynamoItem, DynamoRef } from '../models/dynamo';

const client = new AWS.DynamoDB.DocumentClient();

export const saveToDynamo = async (data: any, timeStamp: string) => {
  const params: DynamoItem = {
    TableName: config.dbName,
    Item: {
      // Primary db key as ISO date string
      dateId: new Date().toISOString(),
      // Timestamp in ms of last song that was scrobbed
      lastScrobbed: timeStamp,
      // Same timestamp as above but readable
      lastScrobbedString: localDS(timeStamp),
      // Array of songs
      songs: data, // TODO Type this
    },
  };
  return client.put(params).promise();
};

export const getDateRef = async (): Promise<number | undefined> => {
  const params: DynamoRef = {
    TableName: config.dbName,
    Key: {
      dateId: config.masterDateRef,
    },
  };
  const ref = await client.get(params).promise();
  return ref.Item?.lastScrobbed;
};

export const updateDateRef = async (timeStamp: string) => {
  const params: DynamoItem = {
    TableName: config.dbName,
    Item: {
      dateId: config.masterDateRef,
      lastScrobbed: timeStamp,
      lastScrobbedString: localDS(timeStamp),
    },
  };
  return client.put(params).promise();
};
