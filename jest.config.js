/** @type {import('ts-jest').JestConfigWithTsJest} */
const settings = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testPathIgnorePatterns: [
    '^.+\\.test-class\\.test\\.ts'
  ],
};

export default settings;