import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      // ts-jest configuration goes here
      // https://huafu.github.io/ts-jest/user/config/
    },
  },
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  testEnvironment: 'node',
  preset: 'ts-jest',
};
export default config;
