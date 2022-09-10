import { ScheduledHandler } from 'aws-lambda';
import { dynamoGetLatestHistory, dynamoSetHistory } from './routes/history';
import Spotify, { HistoryParams } from './services/spotify';
import { isAxiosError } from './utils';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    const spotify = new Spotify();

    const latestHistory = await dynamoGetLatestHistory();
    const latestTimestamp = latestHistory?.timestamp;

    const params: HistoryParams = {};

    // If we already have something in dynamo from the last time we
    // scrobbled, request all songs before that date.

    // Else, if this is deployed for the first time, the returned
    // timestamp is undefined since there is no history element in
    // dynamo. In this case, get all songs before now
    if (latestTimestamp) {
      params.after = new Date(latestTimestamp).getTime();
    } else {
      params.before = new Date().getTime();
    }

    await spotify.fetchHistory(params);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    const count = spotify.count;

    if (count > 0) {
      // Create the actual history for dynamo
      const history = spotify.createHistory();

      await dynamoSetHistory({
        timestamp: new Date(spotify.cursorBefore),
        songs: history,
      });

      console.info(
        `Success! ${count} new ${
          count === 1 ? 'song' : 'songs'
        } have been scrubbed!`
      );
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
