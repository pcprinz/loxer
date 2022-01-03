/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    // only tests set with only
    '**/?(*.)+(test.only).ts',
    // all tests
    '**/?(*.)+(test).ts',
  ],
};
