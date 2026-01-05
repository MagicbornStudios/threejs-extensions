import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setupTests.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      isolatedModules: false,
      useESM: false,
    },
  },
};

export default config;
