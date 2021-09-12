export { default as defaults } from './defaults';
const { env } = process;

interface BaseSecret {
  refresh_token: string;
  client_id: string;
  client_secret: string;
}
interface SpotifySecrets extends BaseSecret {
  grant_type: 'refresh_token';
}

type GoogleSecrets = BaseSecret;

type Config = {
  AWS_TABLE_NAME: string;
  AWS_REGION: string;
  SPOTIFY: Readonly<SpotifySecrets>;
  GOOGLE: Readonly<GoogleSecrets>;
};

const config: Readonly<Config> = {
  AWS_TABLE_NAME: env.TABLE_NAME || '',
  AWS_REGION: env.CUSTOM_AWS_REGION || '',
  SPOTIFY: {
    client_id: env.SPOTIFY_CLIENT_ID || '',
    client_secret: env.SPOTIFY_CLIENT_SECRET || '',
    refresh_token: env.SPOTIFY_REFRESH_TOKEN || '',
    grant_type: 'refresh_token',
  },
  GOOGLE: {
    client_id: env.GOOGLE_CLIENT_ID || '',
    client_secret: env.GOOGLE_CLIENT_SECRET || '',
    refresh_token: env.GOOGLE_REFRESH_TOKEN || '',
  },
};

export default config;
