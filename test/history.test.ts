import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import * as SpotiflyClient from '@spotifly/core';
import { Context, EventBridgeEvent } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { handler } from '../src/handler.history';
import { dynamoDataMapper } from '../src/services/dynamo';
import {
  dynamoFullData,
  emptyResponse,
  spotifyHistoryResponse,
} from './payloads';

jest.mock('../src/services/dynamo');
jest.mock('@aws/dynamodb-data-mapper');
jest.mock('@spotifly/core');

const querySpy = jest.spyOn(dynamoDataMapper, 'query');
const putSpy = jest.spyOn(dynamoDataMapper, 'put');

// This will be overwritten sometimes
const iteratorMock = jest.fn().mockReturnValue([].values());

// @ts-expect-error - This is sufficient for a mock
const qi: QueryIterator<StringToAnyObjectMap> = QueryIterator;

qi[Symbol.iterator] = iteratorMock;

querySpy.mockReturnValue(qi);

const mockSpotifyClient = mockDeep<SpotiflyClient.SpotifyClient>();

mockSpotifyClient.Player.getRecentlyPlayedTracks.mockResolvedValue(
  spotifyHistoryResponse
);

jest.spyOn(SpotiflyClient, 'initialize').mockReturnValue(mockSpotifyClient);

const getPlayedTracks = mockSpotifyClient.Player.getRecentlyPlayedTracks;

beforeEach(() => {
  getPlayedTracks.mockClear();
  querySpy.mockClear();
  putSpy.mockClear();
  iteratorMock.mockClear();
});

describe('Handler', () => {
  it('runs without errors', async () => {
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', unknown>,
      {} as Context,
      () => {}
    );
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy.mock.calls).toMatchSnapshot();
  });

  it('queries all songs if there are no existing ones', async () => {
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', unknown>,
      {} as Context,
      () => {}
    );

    expect(getPlayedTracks.mock.calls[0][0]).toMatchObject({
      before: expect.any(Number),
      limit: 50,
    });
  });

  it('only queries new songs if there are existing ones', async () => {
    iteratorMock.mockReturnValueOnce(dynamoFullData().values());
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', unknown>,
      {} as Context,
      () => {}
    );
    expect(getPlayedTracks.mock.calls[0][0]).toMatchObject({
      after: expect.any(Number),
      limit: 50,
    });
  });

  it('saves nothing to dynamo if there is nothing new', async () => {
    // Overwrite initial history request, mock "no new songs"
    getPlayedTracks.mockResolvedValueOnce(emptyResponse);

    await handler(
      {} as EventBridgeEvent<'Scheduled Event', unknown>,
      {} as Context,
      () => {}
    );
    expect(putSpy).not.toHaveBeenCalled();
  });
});
