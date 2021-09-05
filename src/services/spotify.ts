import axios from 'axios';
import { URLSearchParams } from 'url';
import config, { HistoryParams, RefreshTokenResponse } from '../config';
import { HistoryElement } from '../models/history';

type HistoryResponse = SpotifyApi.UsersRecentlyPlayedTracksResponse;

type HistoryItems = SpotifyApi.PlayHistoryObject[];

export class Spotify {
  private bearerToken: string = '';

  private items: HistoryItems = [];
  private cursorBefore: string = '';
  private cursorAfter: string = '';

  get itemCount() {
    return this.items.length;
  }

  get cursors() {
    return {
      after: this.cursorAfter,
      before: this.cursorBefore,
    };
  }

  async getRefreshToken(): Promise<void> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(config.REFRESH_TOKEN_PARAMS)) {
      params.append(key, value);
    }

    const res = await axios.post<RefreshTokenResponse>(
      'https://accounts.spotify.com/api/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    this.bearerToken = res.data.access_token || '';
  }

  // Gets the raw history from Spotify
  async fetchSpotifyHistory(params: HistoryParams): Promise<void> {
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
      this.cursorAfter = new Date(lastElem).getTime().toString();
      this.cursorBefore = new Date(firstElem).getTime().toString();
    }
  }

  // Create the actual history that will be saved in dynamo
  async createHistory() {
    return await this.items.reduce(async (acc, el) => {
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

      acc
        .then(a =>
          a.push({
            name: el.track.name,
            id: el.track.id,
            artists: genre.data.artists.map(el => ({
              artistName: el.name,
              artistId: el.id,
              // JSON does not allow commas in a string
              genres: el.genres.join(';'),
            })),
          })
        )
        .catch(err => console.error(err));
      return acc;
    }, Promise.resolve(<HistoryElement[]>[]));
  }

  // Get schwifty
  *[Symbol.iterator]() {
    yield* this.items;
  }
}
