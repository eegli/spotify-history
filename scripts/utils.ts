import { readFileSync } from 'fs';

export function read<T = any>(path: string): T {
  try {
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    throw new Error(`Cannot read file ${path}`);
  }
}
