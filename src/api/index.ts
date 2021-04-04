import axios, { AxiosRequestConfig } from 'axios';

export enum Endpoints {
  RefreshToken = 'https://accounts.spotify.com/api/token',
  GetHistory = 'https://api.spotify.com/v1/me/player/recently-played',
}

export interface GetHistoryParams {
  limit?: number;
  after?: number;
  before?: number;
}

export interface GetHistoryResponse
  extends SpotifyApi.UsersRecentlyPlayedTracksResponse {}

export interface GetRefreshTokenParams {
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
  refresh_token: string;
}

export interface GetRefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export function instance<T>(params?: T) {
  return axios.create({
    params,
  });
}
