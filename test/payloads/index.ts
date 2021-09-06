import { History } from '../../src/models/history';
import dynamoDBData from '../../dynamo-seed.json';

import spotifyHistoryJSONResponse from './spotify-history.json';
import spotifyArtistsJSONResponse__1 from './spotify-artists-1.json';
import spotifyArtistsJSONResponse__2 from './spotify-artists-2.json';
import spotifyArtistsJSONResponse__3 from './spotify-artists-3.json';
import { AxiosResponse } from 'axios';
import { RefreshTokenResponse } from '../../src/config';

function fakeAxiosRes<T>(payload: T): AxiosResponse<T> {
  return {
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

export const dynamoData = (): History[] => {
  return dynamoDBData.map((hst: any) => {
    const history: History = new History();
    Object.assign(history, { ...hst });
    return history;
  });
};

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

export const spotifyArtistsResponse: AxiosResponse[] = [
  fakeAxiosRes(spotifyArtistsJSONResponse__1),
  fakeAxiosRes(spotifyArtistsJSONResponse__2),
  fakeAxiosRes(spotifyArtistsJSONResponse__3),
];

export const emptyResponse = fakeAxiosRes({ items: [] });
