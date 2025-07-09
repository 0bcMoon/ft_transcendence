module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/$1',
    '^@db/(.*)$': '<rootDir>/db/$1',
  },
  // Setup files to run before tests
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Enable source maps for better debugging
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  // Increase timeout for debugging
  testTimeout: 30000,
  // Run tests serially when debugging
  maxWorkers: 1,
};
