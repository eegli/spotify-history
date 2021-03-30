const { env } = process;

type Envs = 'prod' | 'stg';

type EnvConfig = {
  dbName: string;
};

type SharedConfig = {
  uri: string;
};

const currEnv: Envs = env.STAGE as Envs;

const sharedConfig: SharedConfig = {
  uri: 'spotify-history-stg.rfb2f.mongodb.net',
};

const envConfig: Record<Envs, EnvConfig> = {
  stg: {
    dbName: 'sample_mflix',
  },
  prod: {
    dbName: 'sample_mflix2',
  },
};

export const config = {
  ...sharedConfig,
  ...envConfig[currEnv],
} as const;
