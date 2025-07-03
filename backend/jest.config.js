module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/$1',
    '^@db/(.*)$': '<rootDir>/db/$1',
  },
};
