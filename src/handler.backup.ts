import { ScheduledHandler } from 'aws-lambda';
import moment from 'moment';
import config from './config';
import { DynamoHistoryElement } from './config/types';
import { backupHistory, BackupParams } from './routes/backup';
import { dynamoGetWeeklyHistory } from './routes/history';
import { fileSizeFormat, zeroPrefix } from './utils';

export const handler: ScheduledHandler = async () => {
  const m = moment();

  const year = m.year();
  const week = zeroPrefix(m.isoWeek());
  const month = zeroPrefix(m.month() + 1);

  const folderName =
    process.env.STAGE === 'production'
      ? config.backupFolderNameProd
      : config.backUpFolderNameStage;

  try {
    const historyItems = await dynamoGetWeeklyHistory();

    const backupParams: BackupParams<DynamoHistoryElement[]> = {
      fileName: `spotify_bp_${year}-${month}-w${week}`,
      folderName,
      // Time metadata for the backup
      meta: {
        week: week,
        track_count: historyItems.length,
        date_created: m.toString(),
      },
      data: historyItems,
    };

    const backup = await backupHistory(backupParams);

    const {
      data: { size, webViewLink },
    } = backup;

    const fileSize = size ? parseInt(size) : 0;

    console.info(`History backup for week ${week} completed.`);
    console.info('Songs count: ', historyItems.length);
    console.info('Backup file size: ', fileSizeFormat(fileSize));
    console.info('Link: ', webViewLink);
  } catch (err) {
    console.error('Could not backup history', err);
  }
};
