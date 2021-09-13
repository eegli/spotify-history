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
    env.NODE_ENV === 'prod' ? 'SpotifyHistory' : 'SpotifyHistory_STG',
};

export default defaults;
