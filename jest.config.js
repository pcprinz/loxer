/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    // only tests
    '**/?(*.)+(test.only).ts',
    // all tests (that are not listed here)
    '**/?(*.)+(test).ts',
  ],
};
