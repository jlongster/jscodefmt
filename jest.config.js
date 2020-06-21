"use strict";

const installPrettier = require("./scripts/install-prettier");

const ENABLE_CODE_COVERAGE = !!process.env.ENABLE_CODE_COVERAGE;
if (process.env.NODE_ENV === "production" || process.env.INSTALL_PACKAGE) {
  process.env.PRETTIER_DIR = installPrettier();
}
const { TEST_STANDALONE } = process.env;

module.exports = {
  setupFiles: ["<rootDir>/tests_config/run_spec.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns: TEST_STANDALONE
    ? // Can't test plugins on standalone
      ["<rootDir>/tests/vue/with-plugins/"]
    : [],
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["src/**/*.js", "index.js", "!<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: [
    "<rootDir>/standalone.js",
    "<rootDir>/src/document/doc-debug.js",
    "<rootDir>/src/main/massage-ast.js",
  ],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier/local": "<rootDir>/tests_config/require_prettier.js",
    "prettier/standalone": "<rootDir>/tests_config/require_standalone.js",
  },
  testEnvironment: "node",
  transform: {},
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
