const { env } = process;

type Config = {
  dbName: string;
  masterDateRef: string;
  sptClientId: string;
  sptClientSecret: string;
  sptRefreshToken: string;
};

const config: Config = {
  dbName: env.DB_NAME || '',
  masterDateRef: '1970-01-01T00:00:00.001Z',
  sptClientId: env.CLIENT_ID || '',
  sptClientSecret: env.CLIENT_SECRET || '',
  sptRefreshToken: env.REFRESH_TOKEN || '',
};

export default config;
