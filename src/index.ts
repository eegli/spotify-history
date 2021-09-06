import { ScheduledHandler } from 'aws-lambda';
import { HistoryParams } from './config';
import { dynamoGetLatestHistory, dynamoSetHistory } from './services/dynamo';
import Spotify from './services/spotify';
import { isAxiosError } from './utils';

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
      params.after = parseInt(latestTimestamp);
    } else {
      params.before = new Date().getTime();
    }

    await spotify.fetchSpotifyData(params);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    const count = spotify.items.length;
    if (count > 0) {
      // Create the actual history for dynamo
      const history = await spotify.createHistory();

      await dynamoSetHistory({
        timestamp: spotify.cursorBefore,
        count,
        songs: history,
      });

      const songs = count === 1 ? 'song' : 'songs';
      console.log(`Success! ${count} new ${songs} have been scrubbed!`);
      // No new items since last scrobbed
    } else {
      console.log(`No new songs have been scrubbed!`);
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
      console.error('Something went wrong', err);
    }
  }
};
