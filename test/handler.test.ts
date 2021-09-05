import { Context, EventBridgeEvent } from 'aws-lambda';
import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { handler } from '../src/';
import { rawSpotifyHistory, enrichedSpotifyHistory } from './payloads';

jest.mock('@aws/dynamodb-data-mapper');
jest.mock('../src/services/dynamo');

jest.mock('../src/services/spotify', () => {
  return {
    Spotify: jest.fn().mockImplementation(() => {
      return {
        getRefreshToken: jest.fn(),
        fetchSpotifyData: jest.fn(),
        createHistory: jest.fn().mockResolvedValue(enrichedSpotifyHistory()),
        items: rawSpotifyHistory(),
      };
    }),
  };
});

import {
  dynamoGetLatestHistory,
  dynamoSetHistory,
  mapper,
} from '../src/services/dynamo';

const mockGetLatestHistory = dynamoGetLatestHistory as jest.MockedFunction<
  typeof dynamoGetLatestHistory
>;

const mockSetHistory = dynamoSetHistory as jest.MockedFunction<
  typeof dynamoSetHistory
>;

const querySpy = jest.spyOn(mapper, 'query');
const iteratorMock = jest.fn();

// @ts-ignore
const qi: QueryIterator<StringToAnyObjectMap> = QueryIterator;
// @ts-ignore
qi[Symbol.iterator] = iteratorMock;

querySpy.mockReturnValue(qi);

beforeEach(() => {
  querySpy.mockClear();
  iteratorMock.mockClear();
});

describe('Handler', () => {
  it('Should run without error', async () => {
    //  iteratorMock.mockReturnValueOnce(dynamoData().values());

    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );

    expect(mockSetHistory).toHaveBeenCalledTimes(1);
    expect(mockSetHistory.mock.calls).toMatchSnapshot();
    expect(mockGetLatestHistory).toHaveBeenCalledTimes(1);
  });
});
