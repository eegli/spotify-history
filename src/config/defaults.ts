import dayjs from 'dayjs';
import { env } from 'process';

type DurArgs = [number, dayjs.ManipulateType];

export type Defaults = Record<'dynamoExpireAfter' | 'backupRange', DurArgs> & {
  backupFolderName: string;
};

const defaults: Readonly<Defaults> = {
  dynamoExpireAfter: [1, 'month'],
  backupRange: [1, 'week'],
  backupFolderName:
    env.NODE_ENV === 'prod'
      ? 'SpotifyHistory'
      : env.NODE_ENV === 'stg'
      ? 'SpotifyHistory_STG'
      : 'SpotifyHistory_LOCAL',
};

export default defaults;
