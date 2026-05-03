/** @type {import('jest').Config} */
module.exports = {
  displayName: 'rn',
  preset: 'jest-expo',
  rootDir: '.',
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/src/**/*.rn.test.ts',
    '<rootDir>/src/**/*.rn.test.tsx',
    '<rootDir>/app/**/*.rn.test.tsx',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind))',
  ],
};
