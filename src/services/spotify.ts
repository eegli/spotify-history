import { initialize, SpotifyClient } from '@spotifly/core';
import config from '../config';
import { DynamoHistoryElement } from '../config/types';

export type HistoryParams = Parameters<
  SpotifyClient['Player']['getRecentlyPlayedTracks']
>[0];

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
  private client: SpotifyClient;
  private items: SpotifyApi.PlayHistoryObject[] = [];
  // Unix timestamps
  cursorBefore = 0;
  cursorAfter = 0;

  constructor() {
    this.client = initialize({
      clientId: config.SPOTIFY.client_id,
      clientSecret: config.SPOTIFY.client_secret,
      refreshToken: config.SPOTIFY.refresh_token,
    });
  }

  get count() {
    return this.items.length;
  }

  // Gets the raw history from Spotify
  async fetchHistory(params: HistoryParams): Promise<void> {
    const res = await this.client.Player.getRecentlyPlayedTracks({
      ...params,
      limit: 50,
    });

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
