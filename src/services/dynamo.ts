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
        // Date of most recently played item - useful to quickly see the date
        lastScrobbedString: dateString,
        // Array of songs
        songs: data,
      },
    })
    .promise();
};

export const getDateRef = async (): Promise<number | undefined> => {
  const ref = await client
    .get({
      TableName: config.dbName,
      Key: {
        // STATIC
        dateId: new Date(1).toISOString(),
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
        // STATIC
        dateId: new Date(1).toISOString(),
        lastScrobbed: timeStamp,
        lastScrobbedString: dateString,
      },
    })
    .promise();
};
