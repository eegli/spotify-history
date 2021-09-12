import { DurationInputArg1, DurationInputArg2 } from 'moment';

type DurationArgs = [DurationInputArg1, DurationInputArg2];

export type Defaults = Record<
  'dynamoExpireAfter' | 'backupRange',
  DurationArgs
> & { backupFolderNameProd: string; backUpFolderNameStage: string };

const defaults: Readonly<Defaults> = {
  dynamoExpireAfter: [30, 'days'],
  backupRange: [1, 'week'],
  backupFolderNameProd: 'SpotifyHistory',
  backUpFolderNameStage: 'SpotifyHistory_STG',
};

export default defaults;
