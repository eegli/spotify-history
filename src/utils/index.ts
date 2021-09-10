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
  // https://www.w3resource.com/javascript-exercises/javascript-date-exercise-24.php
  const tdt = new Date(date.valueOf());
  const dayn = (date.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  const firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - date.valueOf()) / 604800000);

  // Year, month, week
  return { year: date.getFullYear(), month, week };
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
