import { AxiosResponse } from 'axios';
import { GaxiosResponse } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import dynamoSeed from '../../dynamo-seed.json';
import { DynamoHistoryElement } from '../../src/config/types';
import { History } from '../../src/models/history';
import { RefreshTokenResponse } from '../../src/services/spotify';
import spotifyArtistsJSONResponse__1 from './spotify-artists-1.json';
import spotifyArtistsJSONResponse__2 from './spotify-artists-2.json';
import spotifyArtistsJSONResponse__3 from './spotify-artists-3.json';
import spotifyHistoryJSONResponse from './spotify-history.json';

function fakeAxiosRes<T>(payload: T): AxiosResponse<T> {
  return {
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

function fakeGaxiosRes<T>(payload: T): GaxiosResponse<T> {
  return {
    config: {},
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    request: { responseURL: 'test' },
  };
}

export const driveListResponse = fakeGaxiosRes<drive_v3.Schema$FileList>({
  files: [{ name: 'folder', id: 'id' }],
});

export const driveCreateResponse = fakeGaxiosRes<drive_v3.Schema$File>({
  size: '69',
  webViewLink: 'http://example.com',
});

export const spotifyPutTokenResponse = fakeAxiosRes<RefreshTokenResponse>({
  access_token: 'token',
  token_type: '',
  scope: '',
  expires_in: 1,
});

// The initial GET request for the history
// https://api.spotify.com/v1/me/player/recently-played'
export const spotifyHistoryResponse = fakeAxiosRes(spotifyHistoryJSONResponse);

// Artists - three responses, mocking the three GET requests for the artists from the above response
// https://api.spotify.com/v1/artists
// TODO make generics work
export const spotifyArtistsResponse1 = fakeAxiosRes(
  spotifyArtistsJSONResponse__1
);
export const spotifyArtistsResponse2 = fakeAxiosRes(
  spotifyArtistsJSONResponse__2
);
export const spotifyArtistsResponse3 = fakeAxiosRes(
  spotifyArtistsJSONResponse__3
);

export const emptyResponse = fakeAxiosRes({ items: [] });

// Mock full dynamo data
export const dynamoFullData = (): History[] => {
  return dynamoSeed.map(elem => {
    const history: History = new History();
    Object.assign(history, { ...elem });
    return history;
  });
};

// Mock the data that is backed up
export const dynamoBackupData = (): DynamoHistoryElement[] => {
  // Reduce the history to only get the songs
  return dynamoSeed.reduce((acc, curr) => {
    if (curr.songs) {
      acc.push(...curr.songs);
    }
    return acc;
  }, <DynamoHistoryElement[]>[]);
};
