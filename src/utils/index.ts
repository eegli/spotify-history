import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'fs';

export type PickType<T, K extends keyof T> = T[K];

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export const write = (data: unknown, fileName: string): void => {
  writeFileSync(fileName + '.json', JSON.stringify(data));
};

export const zeroPrefix = (n: number, pad = 2): string => {
  return n.toString().padStart(pad, '0');
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
