import axios from 'axios';
import { URLSearchParams } from 'url';
import config from '../config';
import { DynamoHistoryElement } from '../config/types';

export type HistoryParams = {
  limit: 50;
  before?: number;
  after?: number;
};

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

// Export so we can use it in the tests
export type HistoryResponse = SpotifyApi.UsersRecentlyPlayedTracksResponse;
export type MultipleArtistsResponse = SpotifyApi.MultipleArtistsResponse;

export default class Spotify {
  private bearerToken = '';
  private items: SpotifyApi.PlayHistoryObject[] = [];
  // Unix timestamps
  cursorBefore = 0;
  cursorAfter = 0;

  get count() {
    return this.items.length;
  }

  async getRefreshToken(): Promise<void> {
    const res = await axios.post<RefreshTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams(config.SPOTIFY),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    this.bearerToken = res.data.access_token;
  }

  // Gets the raw history from Spotify
  async fetchHistory(params: HistoryParams): Promise<void> {
    const requestParams: HistoryParams = { ...params, limit: 50 };
    const res = await axios.get<HistoryResponse>(
      'https://api.spotify.com/v1/me/player/recently-played',
      {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        params: requestParams,
      }
    );
    if (res.data.items.length > 0) {
      this.items = res.data.items;

      const firstElem = this.items[0].played_at;
      const lastElem = this.items[this.items.length - 1].played_at;

      // Manually set the cursors so that we know the time of the
      // first and last song of this history
      this.cursorAfter = new Date(lastElem).getTime();
      this.cursorBefore = new Date(firstElem).getTime();
    }
  }

  // Create the actual history that will be saved in dynamo
  createHistory(): DynamoHistoryElement[] {
    return this.items.reduce((acc, el) => {
      acc.push({
        name: el.track.name,
        id: el.track.id,
        playedAt: new Date(el.played_at).toISOString(),
      });

      return acc;
    }, <DynamoHistoryElement[]>[]);
  }
}
