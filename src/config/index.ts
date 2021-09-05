const { env } = process;

export interface RefreshTokenParams {
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
  refresh_token: string;
}
export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export interface HistoryParams {
  after?: number;
  before?: number;
  limit?: number;
}

type Config = {
  TABLE_NAME: string;
  AWS_REGION: string;
  REFRESH_TOKEN_PARAMS: Readonly<RefreshTokenParams>;
};

const config: Readonly<Config> = {
  TABLE_NAME: env.TABLE_NAME || '',
  AWS_REGION: env.CUSTOM_AWS_REGION || '',
  REFRESH_TOKEN_PARAMS: {
    client_id: env.CLIENT_ID || '',
    client_secret: env.CLIENT_SECRET || '',
    refresh_token: env.REFRESH_TOKEN || '',
    grant_type: 'refresh_token',
  },
};

export default config;
