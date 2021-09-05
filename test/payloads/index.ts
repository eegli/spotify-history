import { History } from '../../src/models/history';
import { HistoryItems } from '../../src/services/spotify';
import dynamoDBData from '../../dynamo-seed.json';
import spotifyResponse from './spotify-history-response';
import spotifySongs from './spotify-songs';

export const dynamoData = (): History[] => {
  return dynamoDBData.map((hst: any) => {
    const history: History = new History();
    Object.assign(history, { ...hst });
    return history;
  });
};

export const enrichedSpotifyHistory = () => spotifySongs;

export const rawSpotifyHistory = (): HistoryItems => {
  const { items } = spotifyResponse;
  return items as any as HistoryItems;
};
