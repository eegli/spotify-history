import { ScheduledHandler } from 'aws-lambda';

import { getLatestHistory, setHistory } from './services/dynamo';

import { Spotify } from './services/spotify';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    const spotify = new Spotify();

    // Use refresh token to get access token
    await spotify.getRefreshToken();

    const latestHistory = await getLatestHistory();
    const latestTimestamp = latestHistory?.timestamp;

    // If this is deployed for the first time, the returned timestamp
    // is undefined since there is no history element in dynamo (= no
    // latest timestamp). If that is the case, get all songs since the
    // beginning of time!

    // 1 is simply new Date(1).getTime(). Note that generally,
    // timestamps are handled as strings, but the Spotify API expects
    // a timestamp parameter as a number
    const timestamp = latestTimestamp ? parseInt(latestTimestamp) : 1;

    await spotify.getHistory({ after: timestamp, limit: 50 });

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    if (spotify.itemCount > 0) {
      const enrichedTracks = await spotify.enrichHistory();
      const currentTimestamp = spotify.cursors.before;

      await setHistory(currentTimestamp, enrichedTracks);
      console.log(
        `Success! ${spotify.itemCount} new songs have been scrubbed!`
      );
      // No new items since last scrobbed
    } else {
      console.log(`No new songs have been scrubbed!`);
    }
  } catch (err) {
    console.error('Something went wrong', err);
  }
};
