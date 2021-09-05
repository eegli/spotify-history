import { History } from '../../src/models/history';
import { HistoryItems } from '../../src/services/spotify';
import dynamoHistoryData from './dynamo-history.json';
import spotifyResponseData from './spotify';

export const dynamoData = (): History[] => {
  return dynamoHistoryData.map((hst: any) => {
    const history: History = new History();
    Object.assign(history, { ...hst });
    return history;
  });
};

export const historyData = () => {
  return dynamoHistoryData.map(spt => {
    return spt.songs;
  });
};

export const spotifyResponse = (): HistoryItems => {
  const { items } = spotifyResponseData;
  return items as any as HistoryItems;
};
