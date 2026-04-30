/** @type {import('jest').Config} */
module.exports = {
  displayName: 'node',
  testEnvironment: 'node',
  testEnvironmentOptions: {
    // Force CJS resolution; otherwise msw v2 resolves to .mjs which
    // Jest's CJS runner can't require, falling back to .ts source.
    customExportConditions: ['require', 'node', 'node-addons'],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/.*\\.rn\\.test\\.tsx?$'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowJs: true,
        module: 'commonjs',
        target: 'es2020',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // MSW v2 resolves to .mjs via package.json `exports`; Jest's CJS
    // runner falls back to .ts source. Force the CJS build.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.js',
  },
  setupFilesAfterEach: ['<rootDir>/jest.setup.node.js'],
};
