import { ScheduledHandler } from 'aws-lambda';

import { saveToDynamo, getDateRef, updateDateRef } from './services/dynamo';

import { HistoryParams, Spotify } from './models/spotify';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    const spotify = new Spotify();

    // Use refresh token to get access token
    spotify.getRefreshToken();
    console.log(spotify.bearerToken);

    // Get the date of the last song that was saved in Dynamo (a.k.a
    // master date ref of the previous lambda invocation)
    const lastPlayed = await getDateRef();

    // If this is deployed for the first time, there is no master date
    // ref (lambda runs for the first time). In this case, all songs
    // before "now" are fetched. The logic is all in the cursor params
    const spotifyParams: HistoryParams = lastPlayed
      ? {
          after: lastPlayed,
          limit: 50,
        }
      : {
          before: Date.now(),
          limit: 50,
        };

    // Get songs
    await spotify.getHistory(spotifyParams);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    if (spotify.history.length > 0) {
      // Unix timestamp in milliseconds - our new master date ref
      const newDateRef = parseInt(spotify.historyMeta.cursors.after);
      // Filter out unwanted attributes - not everything needs to go
      // to Dynamo
      const fullSongs = await spotify.enrichHistory();
      console.log(fullSongs);
      // Store new songs in Dynamo
      await saveToDynamo(fullSongs, newDateRef);

      // Update master ref with the new timestamp
      await updateDateRef(newDateRef);
      console.log(
        `Success! ${spotify.history.length} new songs have been scrubbed!`
      );
      // No new items since last scrobbed
    } else {
      console.log(`No new songs have been scrubbed!`);
    }
  } catch (err) {
    console.error('Something went wrong', err);
  }
};
