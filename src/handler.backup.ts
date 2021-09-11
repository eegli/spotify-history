import { ScheduledHandler } from 'aws-lambda';
import config from './config';
import { backupHistory, BackupParams } from './routes/backup';
import { dynamoGetWeeklyHistory } from './routes/history';
import { fileSizeFormat, getCurrDates } from './utils';

export const handler: ScheduledHandler = async () => {
  try {
    const { year, month, week, ts, date } = getCurrDates();

    const historyItems = await dynamoGetWeeklyHistory();

    const folderName =
      process.env.STAGE === 'production'
        ? config.backupFolderNameProd
        : config.backUpFolderNameStage;

    // Include metadata (weekly backup)
    const backupParams: BackupParams = {
      fileName: `spotify_bp_${year}-${month}-w${week}`,
      folderName,
      data: {
        year,
        week,
        created: date,
        created_unix: ts,
        count: historyItems.length,
        items: historyItems,
      },
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
