import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'fs';

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export type PickType<T, K extends keyof T> = T[K];

export const write = (data: unknown, fileName: string): void => {
  writeFileSync(fileName + '.json', JSON.stringify(data));
};

export const backupFileNameDates = (date: Date) => {
  // Leading zero for month
  const m = date.getMonth();
  const month = m < 10 ? '0' + m : m.toString();

  // Get number of week
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  // Year, month, week
  return [date.getFullYear(), month, week];
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
