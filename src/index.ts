import { ScheduledHandler } from 'aws-lambda';
import axios from 'axios';
import { GetHistoryParams } from './api';
import { saveToDynamo, getDateRef, updateDateRef } from './services/dynamo';

import { getHistory, getRefreshToken } from './services/spotify';
import { extractSongInfo } from './utils/song';
import testData from './utils/testData';
export const handler: ScheduledHandler = async (): Promise<void> => {
  try {
    // Use refresh token to get access token
    const accessToken = await getRefreshToken();

    // Get the date of the last song that was saved in Dynamo (a.k.a
    // master date ref of the previous lambda invocation)
    const lastPlayed = await getDateRef();

    // If this is deployed for the first time, there is no master date
    // ref (lambda runs for the first time). In this case, all songs
    // before "now" are fetched. The logic is all in the cursor params
    const spotifyParams: GetHistoryParams = lastPlayed
      ? {
          after: lastPlayed,
          limit: 50,
        }
      : {
          before: Date.now(),
          limit: 50,
        };

    // Get songs
    const songs = await getHistory(accessToken, spotifyParams);

    // Check if we have new items since last invocation or if nothing
    // has been listened to during that time
    if (songs.items.length > 0) {
      // Filter out unwanted attributes - not everything needs to go
      // to Dynamo
      const cleanSongs = songs.items.map(extractSongInfo);
      // Unix timestamp in milliseconds - our new master date ref
      const newDateRef = parseInt(songs.cursors.after);

      // Store new songs in Dynamo
      await saveToDynamo(cleanSongs, newDateRef);

      // Update master ref with the new timestamp
      await updateDateRef(newDateRef);
      console.log(
        `Success! ${songs.items.length} new songs have been scrubbed!`
      );
      // No new items since last scrobbed
    } else {
      console.log(`No new songs have been scrubbed!`);
    }
  } catch (err) {
    console.error('Something went wrong', err);
  }
};

const genres = testData.items
  .reduce((acc, el) => {
    acc.push(el.track.artists[0].id);
    return acc;
  }, <string[]>[])
  .reduce(async (acc, el) => {
    const genre = await axios.get<SpotifyApi.SingleArtistResponse>(
      `https://api.spotify.com/v1/artists/${el}`,
      {
        headers: {
          Authorization:
            'Bearer BQAZRuyMPChoOSIf79aTh2vGCpBGPAzYguq1TVO7uvonIIXfh-B5rMzqTDkwRTlt7D4p8YGGJhbhk5seFh-znsZQ437w4_zE6JCYiZ9DrifyNagUlqu32KVa-CiKuRIAuR6JgNIFNjK7nDJRHIu4QB9W_Q5tbHgL0K0u4aE',
        },
      }
    );
    acc.then(a => a.push(genre.data.genres));
    return acc;
  }, Promise.resolve(<string[][]>[]));
genres.then(res => console.log(res));
