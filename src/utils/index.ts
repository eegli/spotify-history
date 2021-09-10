import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'fs';
import moment from 'moment';

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export type PickType<T, K extends keyof T> = T[K];

export const write = (data: unknown, fileName: string): void => {
  writeFileSync(fileName + '.json', JSON.stringify(data));
};

export const getCurrDates = () => {
  const m = moment();
  // Leading zero for month
  const _month = m.month() + 1;
  const month = _month < 10 ? '0' + _month : _month.toString();

  const week = m.isoWeek();
  const year = m.year();
  const ts = m.toISOString();

  // Year, month, week
  return { ts, year, month, week };
};

// https://stackoverflow.com/a/18650828
export const fileSizeFormat = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
