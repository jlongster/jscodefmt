"use strict";

const ENABLE_COVERAGE = !!process.env.CI;

module.exports = {
  setupFiles: ["<rootDir>/tests_config/run_spec.js"],
  snapshotSerializers: ["<rootDir>/tests_config/raw-serializer.js"],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns: ["tests/new_react", "tests/more_react"],
  collectCoverage: ENABLE_COVERAGE,
  collectCoverageFrom: ["src/**/*.js"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/doc-debug.js",
    "<rootDir>/src/clean-ast.js"
  ]
};
