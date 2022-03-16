import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { Context, EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { handler } from '../src/handler.history';
import { dynamoDataMapper } from '../src/services/dynamo';
import Spotify, { HistoryParams } from '../src/services/spotify';
import {
  dynamoFullData,
  emptyResponse,
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
const fetchSpotifySpy = jest.spyOn(Spotify.prototype, 'fetchHistory');

beforeEach(() => {
  mockAxios.post.mockResolvedValue(spotifyPutTokenResponse);

  mockAxios.get.mockResolvedValueOnce(spotifyHistoryResponse);

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
    iteratorMock.mockReturnValueOnce(dynamoFullData().values());
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
