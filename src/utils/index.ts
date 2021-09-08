import axios, { AxiosError } from 'axios';

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);

export type PickType<T, K extends keyof T> = T[K];
