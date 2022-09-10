import { drive_v3 } from '@googleapis/drive';
import { DataResponse } from '@spotifly/core';
import { GaxiosResponse } from 'googleapis-common';
import dynamoSeed from '../../dynamo-seed.json';
import { DynamoHistoryElement } from '../../src/config/types';
import { History } from '../../src/models/history';
import spotifyHistoryEmptyJSONResponse from './spotify-history-response-empty.json';
import spotifyHistoryJSONResponse from './spotify-history-response.json';

function fakeSpotiflyRes<T>(payload: T): DataResponse<T> {
  return {
    data: payload,
    statusCode: 200,
    headers: {},
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

export const spotifyHistoryResponse = fakeSpotiflyRes(
  spotifyHistoryJSONResponse as unknown as SpotifyApi.UsersRecentlyPlayedTracksResponse
);

export const emptyResponse =
  fakeSpotiflyRes<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
    spotifyHistoryEmptyJSONResponse
  );

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
