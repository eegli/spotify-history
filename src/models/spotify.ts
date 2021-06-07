import axios from 'axios';
import { URLSearchParams } from 'url';
import config from '../config';

interface RefreshTokenRes {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export interface HistoryParams {
  limit?: number;
  after?: number;
  before?: number;
}

type HistoryResponse = SpotifyApi.UsersRecentlyPlayedTracksResponse;

type HistoryMeta = Pick<
  SpotifyApi.CursorBasedPagingObject<SpotifyApi.PlayHistoryObject>,
  'cursors'
>;

type History = SpotifyApi.PlayHistoryObject[];

interface TrackObjEnriched {
  name: string;
  id: string;
  artists: {
    artistName: string;
    artistId: string;
    genres: string;
  }[];
}

export class Spotify {
  bearerToken: string = '';
  history: History = [];
  historyMeta: HistoryMeta = {
    cursors: {
      after: '',
      before: '',
    },
  };

  async getRefreshToken(): Promise<void> {
    const params = new URLSearchParams();
    params.append('client_id', config.sptClientId);
    params.append('client_secret', config.sptClientSecret);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', config.sptRefreshToken);

    const res = await axios.post<RefreshTokenRes>(
      'https://accounts.spotify.com/api/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log(res);
    this.bearerToken = res.data.access_token || '';
  }

  async getHistory(params: HistoryParams): Promise<void> {
    const res = await axios.get<HistoryResponse>(
      'https://api.spotify.com/v1/me/player/recently-played',
      {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        params,
      }
    );
    this.history = res.data.items;
  }

  // https://dev.to/pedrohasantiago/typescript-adjusting-types-in-reduce-function-with-an-async-callback-2kc8
  async enrichHistory() {
    return await this.history.reduce(async (acc, el) => {
      const genre = await axios.get<SpotifyApi.MultipleArtistsResponse>(
        `https://api.spotify.com/v1/artists`,
        {
          params: {
            ids: el.track.artists.map(artist => artist.id).join(','),
          },
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
        }
      );
      console.log(genre);
      acc
        .then(a =>
          a.push({
            name: el.track.name,
            id: el.track.id,
            artists: genre.data.artists.map(el => ({
              artistName: el.name,
              artistId: el.id,
              genres: el.genres.join(','),
            })),
          })
        )
        .catch(err => console.log(JSON.stringify(err)));
      return acc;
    }, Promise.resolve(<TrackObjEnriched[]>[]));
  }
}
