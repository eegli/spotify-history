import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      // ts-jest configuration goes here
      // https://huafu.github.io/ts-jest/user/config/
    },
  },
  roots: ['./test', './src'],
  setupFiles: ['./test/jest.setup.ts'],
  preset: 'ts-jest',
  collectCoverageFrom: ['./src/**/*', '!./src/utils/**/*'],
};
export default config;
