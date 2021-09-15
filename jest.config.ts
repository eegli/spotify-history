import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      // https://huafu.github.io/ts-jest/user/config/
      // isolatedModules: true,
    },
  },
  roots: ['./test', './src'],
  setupFiles: ['./test/jest-setup.ts'],
  preset: 'ts-jest',
  maxWorkers: 1,
  collectCoverageFrom: ['./src/**/*', '!./src/utils/**/*'],
};
export default config;
