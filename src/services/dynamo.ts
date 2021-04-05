import config from '../config';

import AWS from 'aws-sdk';
import { localDS } from '../utils/date';

const client = new AWS.DynamoDB.DocumentClient();

export const saveToDynamo = async (data: any, timeStamp: string) => {
  const dateString = localDS(timeStamp);
  return client
    .put({
      TableName: config.dbName,
      Item: {
        // Primary db key as ISO date string
        dateId: new Date().toISOString(),
        // Timestamp in ms of last song that was scrobbed
        lastScrobbed: timeStamp,
        // Same timestamp as above but readable
        lastScrobbedString: dateString,
        // Array of songs
        songs: data, // TODO Type this
      },
    })
    .promise();
};

export const getDateRef = async (): Promise<number | undefined> => {
  const ref = await client
    .get({
      TableName: config.dbName,
      Key: {
        dateId: config.masterDateRef,
      },
    })
    .promise();
  return ref.Item?.lastScrobbed;
};

export const updateDateRef = async (timeStamp: string) => {
  const dateString = localDS(timeStamp);
  return client
    .put({
      TableName: config.dbName,
      Item: {
        dateId: config.masterDateRef,
        lastScrobbed: timeStamp,
        lastScrobbedString: dateString,
      },
    })
    .promise();
};
