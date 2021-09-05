import { Context, EventBridgeEvent } from 'aws-lambda';
import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { handler } from '../src/';
import {
  rawSpotifyHistory,
  enrichedSpotifyHistory,
  dynamoData,
} from './payloads';
import { mocked } from 'ts-jest/utils';

const mockFetchSpotifyData = jest.fn();
const mockCreateHistory = jest.fn().mockResolvedValue(enrichedSpotifyHistory());
let mockItems: HistoryItems = rawSpotifyHistory();

jest.mock('@aws/dynamodb-data-mapper');
jest.mock('../src/services/spotify', () => {
  return {
    Spotify: jest.fn().mockImplementation(() => {
      return {
        getRefreshToken: jest.fn(),
        fetchSpotifyData: mockFetchSpotifyData,
        createHistory: mockCreateHistory,
        items: mockItems,
      };
    }),
  };
});

import { mapper } from '../src/services/dynamo';
import { HistoryItems, Spotify } from '../src/services/spotify';
import { HistoryParams } from '../src/config';

const mockedSpotify = mocked(Spotify, true);
const querySpy = jest.spyOn(mapper, 'query');
const putSpy = jest.spyOn(mapper, 'put');

const iteratorMock = jest.fn();
// @ts-ignore
const qi: QueryIterator<StringToAnyObjectMap> = QueryIterator;
// @ts-ignore
qi[Symbol.iterator] = iteratorMock;

querySpy.mockReturnValue(qi);

beforeEach(() => {
  jest.resetModules();
  querySpy.mockClear();
  putSpy.mockClear();
  iteratorMock.mockClear();
  mockFetchSpotifyData.mockClear();
  mockCreateHistory.mockClear();
});

describe('Handler', () => {
  it('Should run without errors', async () => {
    iteratorMock.mockReturnValueOnce([].values());
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(mockedSpotify.mock.instances.length).toEqual(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy.mock.calls).toMatchSnapshot();
  });

  it('Should query for all songs if there are no existing ones', async () => {
    iteratorMock.mockReturnValueOnce(dynamoData().values());
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(mockFetchSpotifyData.mock.calls[0][0]).toMatchObject<HistoryParams>({
      after: expect.any(Number),
      limit: expect.any(Number),
    });
  });

  it('Should query for new songs only if there are existing ones', async () => {
    iteratorMock.mockReturnValueOnce([].values());
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );

    expect(mockFetchSpotifyData.mock.calls[0][0]).toMatchObject<HistoryParams>({
      before: expect.any(Number),
      limit: expect.any(Number),
    });
  });

  it('should save nothing to dynamo if there is nothing new', async () => {
    iteratorMock.mockReturnValueOnce([].values());
    // Act as if nothing was fetched from Spotify
    mockItems = [];
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(putSpy).not.toHaveBeenCalled();
  });
});
