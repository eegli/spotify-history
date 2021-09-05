import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      // ts-jest configuration goes here
    },
  },
  roots: ['<rootDir>/test'],
  testEnvironment: 'node',
  preset: 'ts-jest',
};
export default config;
