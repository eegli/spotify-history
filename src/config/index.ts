const { env } = process;

type Config = {
  TABLE_NAME: string;
  masterDateRef: string;
  SPT_CLIENT_ID: string;
  SPT_CLIENT_SECRET: string;
  SPT_REFRESH_TOKEN: string;
  AWS_REGION: string;
};

const config: Readonly<Config> = {
  TABLE_NAME: env.TABLE_NAME || '',
  masterDateRef: '1970-01-01T00:00:00.001Z',
  AWS_REGION: env.AWS_REGION || '',
  SPT_CLIENT_ID: env.CLIENT_ID || '',
  SPT_CLIENT_SECRET: env.CLIENT_SECRET || '',
  SPT_REFRESH_TOKEN: env.REFRESH_TOKEN || '',
};

export default config;
