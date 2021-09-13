import { DurationInputArg1, DurationInputArg2 } from 'moment';
import { env } from 'process';

type DurationArgs = [DurationInputArg1, DurationInputArg2];

export type Defaults = Record<
  'dynamoExpireAfter' | 'backupRange',
  DurationArgs
> & { backupFolderName: string };

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
