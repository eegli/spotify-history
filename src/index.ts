import { ScheduledHandler } from 'aws-lambda';
import { GetHistoryParams } from './api';
import { saveToDynamo, getDateRef, updateDateRef } from './services/dynamo';

import { getHistory, getRefreshToken } from './services/spotify';
import { extractSongInfo } from './utils/song';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    // Use refresh token to get access token
    const accessToken = await getRefreshToken();

    // Get the date of the last song that was scrobbed
    const lastListened = await getDateRef();

    // If this is deployed for the first time, there is no master date
    // ref. In this case, all songs before now are fetched
    const spotifyParams: GetHistoryParams = lastListened
      ? {
          after: lastListened,
          limit: 50,
        }
      : {
          before: Date.now(),
          limit: 50,
        };

    const songs = await getHistory(accessToken, spotifyParams);

    // Check if we have new items since last invocation
    if (songs.items.length > 0) {
      // Filter out unwanted attributes - not everything needs to go
      // to Dynamo
      const cleanSongs = songs.items.map(extractSongInfo);
      // Unix timestamp in milliseconds that reflects the last of when
      // the last song has been scrobbed
      const newDateRef = songs.cursors.after;

      // Store new songs in Dynamo
      await saveToDynamo(cleanSongs, newDateRef);

      // Update master ref with the new timestamp
      await updateDateRef(newDateRef);
      console.log(
        `Success! ${songs.items.length} new songs have been scrubbed!`
      );
      // No new items since last scrobbed
    } else {
      console.log(`Success! No new songs have been scrubbed!`);
    }
  } catch (err) {
    console.error('Something went wrong', err);
  }
};
