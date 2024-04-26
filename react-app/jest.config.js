const { TestEnvironment } = require("jest-environment-jsdom");

const esModules = ['d3', 'd3-array'].join('|');

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  clearMocks: true,
  transformIgnorePatterns: [`/node_modules/(?!delaunator|d3-delaunay|robust-predicates|internmap|d3|d3-array)`, '/node_modules/(?!d3-(interpolate|color))',],
  moduleNameMapper: {
    '^d3$': '<rootDir>/node_modules/d3/dist/d3.min.js',
  },
};