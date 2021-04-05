import config from '../config';

import AWS from 'aws-sdk';
import { localDS } from '../utils/date';
import { DynamoItem, DynamoRef } from '../models/dynamo';

const client = new AWS.DynamoDB.DocumentClient();

export const saveToDynamo = async (data: unknown[], timeStamp: number) => {
  const params: DynamoItem = {
    TableName: config.dbName,
    Item: {
      // Primary db key as ISO date string
      dateId: new Date().toISOString(),
      // Timestamp in ms of last song that was scrobbed
      lastPlayed: timeStamp,
      // Same timestamp as above but readable
      lastPlayedString: localDS(timeStamp),
      // Array of songs
      items: data, // TODO Type this
      itemCount: data.length,
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
  return ref.Item?.lastPlayed;
};

export const updateDateRef = async (timeStamp: number) => {
  const params: DynamoItem = {
    TableName: config.dbName,
    Item: {
      dateId: config.masterDateRef,
      lastPlayed: timeStamp,
      lastPlayedString: localDS(timeStamp),
    },
  };
  return client.put(params).promise();
};
