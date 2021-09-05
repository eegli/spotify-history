import axios, { AxiosError } from 'axios';

export const isAxiosError = (err: unknown): err is AxiosError =>
  axios.isAxiosError(err);
