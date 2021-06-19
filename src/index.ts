import { ScheduledHandler } from 'aws-lambda';

import { dynamoGetLatestHistory, dynamoSetHistory } from './services/dynamo';

import { Spotify, HistoryParams } from './services/spotify';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    const spotify = new Spotify();
    // Use refresh token to get access token
    await spotify.getRefreshToken();

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

    await spotify.getHistoryFromSpotify(params);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    if (spotify.itemCount > 0) {
      // Create the actual history for dynamo
      const history = await spotify.history();
      const currTs = spotify.cursors.before;
      console.log(JSON.stringify(history));
      await dynamoSetHistory(currTs, spotify.itemCount, history);

      const songs = spotify.itemCount === 1 ? 'song' : 'songs';
      console.log(
        `Success! ${spotify.itemCount} new ${songs} have been scrubbed!`
      );
      // No new items since last scrobbed
    } else {
      console.log(`No new songs have been scrubbed!`);
    }
  } catch (err) {
    console.error('Something went wrong', err);
  }
};
