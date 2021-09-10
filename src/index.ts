import { ScheduledHandler } from 'aws-lambda';
import config, { HistoryParams } from './config';
import { backupHistory, BackupParams } from './routes/backup';
import {
  dynamoGetLatestHistory,
  dynamoGetWeeklyHistory,
  dynamoSetHistory,
} from './routes/history';
import Spotify from './services/spotify';
import { backupFileNameDates, fileSizeFormat, isAxiosError } from './utils';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    const spotify = new Spotify();
    // Use refresh token to get access token
    await spotify.getRefreshToken();
    //console.info(spotify.bearerToken);

    const latestHistory = await dynamoGetLatestHistory();
    const latestTimestamp = latestHistory?.timestamp;

    const params: HistoryParams = {
      limit: 50,
    };

    // If we already have something in dynamo from the last time we
    // scrobbed, request all songs before that date.

    // Else, if this is deployed for the first time, the returned
    // timestamp is undefined since there is no history element in
    // dynamo. In this case, get all songs before now
    if (latestTimestamp) {
      params.after = new Date(latestTimestamp).getTime();
    } else {
      params.before = new Date().getTime();
    }

    await spotify.fetchSpotifyData(params);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    const count = spotify.count;

    if (count > 0) {
      // Create the actual history for dynamo
      const history = await spotify.createHistory();

      await dynamoSetHistory({
        timestamp: new Date(spotify.cursorBefore),
        count,
        songs: history,
      });

      const songs = count === 1 ? 'song' : 'songs';
      console.info(`Success! ${count} new ${songs} have been scrubbed!`);
      // No new items since last scrobbed
    } else {
      console.info('No new songs have been scrubbed!');
    }
  } catch (err) {
    if (isAxiosError(err)) {
      const { config, response } = err;
      console.error('Axios error', {
        config,
        status: response?.status,
        statusText: response?.statusText,
      });
    } else {
      console.error('Could not get or create history', err);
    }
  }
};

export const backup: ScheduledHandler = async () => {
  try {
    const d = new Date();
    const { year, month, week } = backupFileNameDates(d);

    const historyItems = await dynamoGetWeeklyHistory();

    const folderName =
      process.env.STAGE === 'production'
        ? config.BACKUP_FOLDER_NAME_PROD
        : config.BACKUP_FOLDER_NAME_STAGE;

    const backupParams: BackupParams = {
      fileName: `spotify_bp_${year}-${month}-w${week}`,
      folderName,
      data: {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        backup_created: d.toISOString(),
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
