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
  masterDateRef: new Date(1).toISOString(),
  sptClientId: env.CLIENT_ID || '',
  sptClientSecret: env.CLIENT_SECRET || '',
  sptRefreshToken: env.REFRESH_TOKEN || '',
};

export default config;
