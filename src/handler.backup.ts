import { ScheduledHandler } from 'aws-lambda';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import { env } from 'process';
import { defaults } from './config';
import { DynamoHistoryElement } from './config/types';
import { backupHistory, BackupParams } from './routes/backup';
import { dynamoGetHistoryRange } from './routes/history';
import { fileSizeFormat, zeroPrefix } from './utils';

dayjs.extend(isoWeek);
dayjs.extend(utc);

export const handler: ScheduledHandler = async () => {
  const now = dayjs();

  const week = zeroPrefix(now.isoWeek());
  const month = zeroPrefix(now.month() + 1);

  const fileName = `spotify_history_${now.year()}-${month}-w${week}`;

  try {
    const history = await dynamoGetHistoryRange();

    const backupParams: BackupParams<DynamoHistoryElement[]> = {
      fileName,
      folderName: defaults.backupFolderName,
      meta: {
        date_created: now.utc().toString(),
        for_week: now.isoWeek(),
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
