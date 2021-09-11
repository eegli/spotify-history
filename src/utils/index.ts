import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'fs';
import moment from 'moment';

export type PickType<T, K extends keyof T> = T[K];

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export const write = (data: unknown, fileName: string): void => {
  writeFileSync(fileName + '.json', JSON.stringify(data));
};

const zeroPrefix = (n: number): string => {
  return n < 10 ? '0' + n : n.toString();
};

export const getCurrDates = () => {
  const m = moment();
  // Leading zero for month
  const month = zeroPrefix(m.month() + 1);

  const week = zeroPrefix(m.isoWeek());
  const year = m.year();
  const ts = m.valueOf();
  const date = m.toString();

  // Year, month, week
  return { ts, date, year, month, week };
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
