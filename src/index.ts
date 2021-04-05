import { ScheduledHandler } from 'aws-lambda';
import { saveToDynamo, getDateRef, updateDateRef } from './services/dynamo';

import { getHistory, getRefreshToken } from './services/spotify';
import { extractSongInfo } from './utils/extractSongInfo';
import log from './utils/logger';

export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    // Use refresh token to get access token
    const accessToken = await getRefreshToken();

    // Get the date of the last song that was scrobbed
    const lastScrobbed = await getDateRef();

    const songs = lastScrobbed
      ? await getHistory(accessToken, {
          // Only request new items after most recent scrob
          after: lastScrobbed,
          limit: 50,
        })
      : // If there is no date ref (first time deployed), request all songs before "now"
        await getHistory(accessToken, {
          before: Date.now(),
          limit: 50,
        });

    // Check if we have new items since last scrobbed
    if (songs.items.length > 0) {
      // Filter out unwanted attributes - not everything needs to go
      // to dynamo
      const cleanSongs = songs.items.map(extractSongInfo);
      // Unix timestamp in milliseconds that reflects the last date
      // that has been scrobbed
      const newDateRef = songs.cursors.after;

      await saveToDynamo(cleanSongs, newDateRef);

      await updateDateRef(newDateRef);
      log.info(`Success! ${songs.items.length} new songs have been scrubbed!`);
      // No new items since last scrobbed
    } else {
      log.info(`Success! No new songs have been scrubbed!`);
    }
  } catch (err) {
    log.error(err, 'Something went wrong');
  }
};
