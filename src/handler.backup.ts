import { ScheduledHandler } from 'aws-lambda';
import moment from 'moment';
import { env } from 'process';
import { defaults } from './config';
import { DynamoHistoryElement } from './config/types';
import { backupHistory, BackupParams } from './routes/backup';
import { dynamoGetHistoryRange } from './routes/history';
import { fileSizeFormat, zeroPrefix } from './utils';

export const handler: ScheduledHandler = async () => {
  const m = moment();

  const week = zeroPrefix(m.isoWeek());
  const month = zeroPrefix(m.month() + 1);

  const fileName = `spotify_history_${m.year()}-${month}-w${week}`;

  try {
    const history = await dynamoGetHistoryRange();

    const backupParams: BackupParams<DynamoHistoryElement[]> = {
      fileName,
      folderName: defaults.backupFolderName,
      meta: {
        date_created: m.toString(),
        for_week: m.isoWeek(),
        track_count: history.length,
        environment: env.NODE_ENV,
      },
      data: history,
    };

    const backup = await backupHistory(backupParams);

    const {
      data: { size, webViewLink },
    } = backup;

    const fileSize = size ? parseInt(size) : 0;

    console.info(`History backup for week ${week} completed.`);
    console.info('Songs count: ', history.length);
    console.info('Backup file size: ', fileSizeFormat(fileSize));
    console.info('Link: ', webViewLink);
  } catch (err) {
    console.error('Could not backup history', err);
  }
};
