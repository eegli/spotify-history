import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { Context, EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { historyHandler as handler } from '../src';
import { dynamoDataMapper } from '../src/services/dynamo';
import Spotify, { HistoryParams } from '../src/services/spotify';
import {
  dynamoData,
  emptyResponse,
  spotifyArtistsResponse1,
  spotifyArtistsResponse2,
  spotifyArtistsResponse3,
  spotifyHistoryResponse,
  spotifyPutTokenResponse,
} from './payloads';

// Mock the dynamo client so that we don't accidentally hit the api
jest.mock('../src/services/dynamo');
jest.mock('@aws/dynamodb-data-mapper');
jest.mock('axios');

const querySpy = jest.spyOn(dynamoDataMapper, 'query');
const putSpy = jest.spyOn(dynamoDataMapper, 'put');

// This will be overwritten sometimes
const iteratorMock = jest.fn().mockReturnValue([].values());

// @ts-ignore
const qi: QueryIterator<StringToAnyObjectMap> = QueryIterator;
// @ts-ignore
qi[Symbol.iterator] = iteratorMock;

querySpy.mockReturnValue(qi);

const mockAxios = axios as jest.Mocked<typeof axios>;
const fetchSpotifySpy = jest.spyOn(Spotify.prototype, 'fetchSpotifyData');

beforeEach(() => {
  mockAxios.post.mockResolvedValue(spotifyPutTokenResponse);

  mockAxios.get
    .mockResolvedValueOnce(spotifyHistoryResponse)
    .mockResolvedValueOnce(spotifyArtistsResponse1)
    .mockResolvedValueOnce(spotifyArtistsResponse2)
    .mockResolvedValueOnce(spotifyArtistsResponse3);

  fetchSpotifySpy.mockClear();
  querySpy.mockClear();
  putSpy.mockClear();
  iteratorMock.mockClear();
});

describe('Handler', () => {
  it('runs without errors', async () => {
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy.mock.calls).toMatchSnapshot();
  });

  it('queries all songs if there are no existing ones', async () => {
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );

    expect(fetchSpotifySpy.mock.calls[0][0]).toMatchObject<HistoryParams>({
      before: expect.any(Number),
      limit: expect.any(Number),
    });
  });

  it('only queries new songs if there are existing ones', async () => {
    iteratorMock.mockReturnValueOnce(dynamoData().values());
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(fetchSpotifySpy.mock.calls[0][0]).toMatchObject<HistoryParams>({
      after: expect.any(Number),
      limit: expect.any(Number),
    });
  });

  it('saves nothing to dynamo if there is nothing new', async () => {
    // Overwrite initial history request, mock "no new songs"
    mockAxios.get = jest.fn().mockResolvedValueOnce(emptyResponse);

    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(putSpy).not.toHaveBeenCalled();
  });
});

describe('Valid test payloads', () => {
  it('fakes an artist request for each artist', () => {
    expect(spotifyHistoryResponse.data.items.length).toEqual(3);
  });
});
