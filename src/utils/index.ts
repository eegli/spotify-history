import axios, { AxiosError } from 'axios';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'fs';

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export type PickType<T, K extends keyof T> = T[K];

export function write(data: unknown, fileName: string): void {
  writeFileSync(fileName + '.json', JSON.stringify(data));
}
