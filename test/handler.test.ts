import { Context, EventBridgeEvent } from 'aws-lambda';
import { QueryIterator, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { handler } from '../src/';
import { historyData, dynamoData, spotifyResponse } from './payloads';

jest.mock('@aws/dynamodb-data-mapper');
jest.mock('../src/services/spotify');
jest.mock('../src/services/dynamo');

import { mapper } from '../src/services/dynamo';
import { Spotify } from '../src/services/spotify';

const querySpy = jest.spyOn(mapper, 'query');
const putSpy = jest.spyOn(mapper, 'put');

const iteratorMock = jest.fn();

// @ts-ignore
const qi: QueryIterator<StringToAnyObjectMap> = QueryIterator;
// @ts-ignore
qi[Symbol.iterator] = iteratorMock;

querySpy.mockReturnValue(qi);

const SpotifyMock = Spotify as jest.MockedClass<typeof Spotify>;

const mockCreateHistory = jest.fn().mockResolvedValue(historyData());

SpotifyMock.prototype.createHistory = mockCreateHistory;
SpotifyMock.prototype.items = spotifyResponse();

beforeEach(() => {
  querySpy.mockClear();
  iteratorMock.mockClear();
});

describe('Handler', () => {
  it('should save songs to dynamo', async () => {
    iteratorMock.mockReturnValueOnce(dynamoData().values());

    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );

    expect(putSpy).toHaveBeenCalledTimes(1);
  });
});
