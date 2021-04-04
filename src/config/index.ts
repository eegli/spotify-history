const { env } = process;

type Config = {
  dbName: string;
  sptClientId: string;
  sptClientSecret: string;
  sptRefreshToken: string;
};

const config: Config = {
  dbName: env.DB_NAME || '',
  sptClientId: env.CLIENT_ID || '',
  sptClientSecret: env.CLIENT_SECRET || '',
  sptRefreshToken: env.REFRESH_TOKEN || '',
};

export default config;
