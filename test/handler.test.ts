import { Context, EventBridgeEvent } from 'aws-lambda';
import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { handler } from '../src/';
import {
  spotifyHistoryResponse,
  spotifyArtistsResponse,
  dynamoData,
  spotifyPutTokenResponse,
  emptyResponse,
} from './payloads';
import Spotify from '../src/services/spotify';

jest.mock('@aws/dynamodb-data-mapper');
jest.mock('axios');

import { mapper } from '../src/services/dynamo';

import axios from 'axios';
import { HistoryParams } from '../src/config';

const querySpy = jest.spyOn(mapper, 'query');
const putSpy = jest.spyOn(mapper, 'put');

const iteratorMock = jest.fn();

// This will be overwritten sometimes
iteratorMock.mockReturnValue([].values());

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
    .mockResolvedValueOnce(spotifyArtistsResponse[0])
    .mockResolvedValueOnce(spotifyArtistsResponse[1])
    .mockResolvedValueOnce(spotifyArtistsResponse[2]);

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
    expect(spotifyHistoryResponse.data.items.length).toEqual(
      spotifyArtistsResponse.length
    );
  });
});
