export default {
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(capture-website|turndown)/)'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/jest.setup.mjs']
}; 