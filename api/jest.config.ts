import type {
  Config,
} from 'jest';

const config: Config = {
  rootDir: 'src',

  extensionsToTreatAsEsm: [
    '.ts',
  ],

  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],

  testRegex:
    '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig:
          '<rootDir>/../tsconfig.spec.json',
      },
    ],
  },

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$':
      '$1',
  },

  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],

  coverageDirectory:
    '../coverage',

  testEnvironment:
    'node',

  clearMocks: true,
};

export default config;