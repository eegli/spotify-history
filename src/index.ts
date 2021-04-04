import { ScheduledHandler } from 'aws-lambda';

import config from './config';

import AWS from 'aws-sdk';
import { getHistory, getRefreshToken } from './services/spotify';

const dateId = new Date().toISOString();

const client = new AWS.DynamoDB.DocumentClient();

const putParams = {
  TableName: 'stg-spotify-history-db',
  Item: {
    dateId,
    songs: [
      {
        added_at: '2021-04-02T10:58:57Z',
        title: 'Peaches (feat. Daniel Caesar & Giveon)',
        artists: ['Justin Bieber', 'Daniel Caesar', 'Giveon'],
        album: 'Justice',
        popularity: 96,
        genres: ['canadian pop', 'pop', 'post-teen pop'],
      },
      {
        added_at: '2021-03-28T22:01:14Z',
        title: '7 Stunden',
        artists: ['LEA', 'Capital Bra'],
        album: 'Treppenhaus',
        popularity: 68,
        genres: ['german pop'],
      },
      {
        added_at: '2021-03-28T16:55:39Z',
        title: 'What You Need (feat. Charlotte Day Wilson)',
        artists: ['KAYTRANADA', 'Charlotte Day Wilson'],
        album: 'What You Need (feat. Charlotte Day Wilson)',
        popularity: 28,
        genres: ['escape room', 'indie soul', 'lgbtq+ hip hop'],
      },
    ],
  },
};

const getParams = {
  TableName: config.dbName,
  Key: {
    dateId: '1970-01-01T00:00:00.001Z',
  },
};

export const handler: ScheduledHandler = async (): Promise<void> => {
  // getLastScrobbed()
  // getSpotifyHistory()
  // putSpotifyHistory()
  try {
    const accessToken = await getRefreshToken();
    const data = await getHistory(accessToken);
    console.log(data);
    const get = await client.get(getParams).promise();
    const put = await client.put(putParams).promise();

    console.log(get);
    console.log(put);
  } catch (err) {
    console.log(err);
  }
};
