"use strict";

const path = require("path");
const installPrettier = require("./scripts/install-prettier");

const PROJECT_ROOT = __dirname;
const isProduction = process.env.NODE_ENV === "production";
const ENABLE_CODE_COVERAGE = Boolean(process.env.ENABLE_CODE_COVERAGE);
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);
const INSTALL_PACKAGE = Boolean(process.env.INSTALL_PACKAGE);

let PRETTIER_DIR = isProduction
  ? path.join(PROJECT_ROOT, "dist")
  : PROJECT_ROOT;
if (INSTALL_PACKAGE || (isProduction && !TEST_STANDALONE)) {
  PRETTIER_DIR = installPrettier(PRETTIER_DIR);
}
process.env.PRETTIER_DIR = PRETTIER_DIR;

const testPathIgnorePatterns = [];
let transform = {};
if (TEST_STANDALONE) {
  testPathIgnorePatterns.push("<rootDir>/tests_integration/");
}
if (isProduction) {
  // `esm` bundles need transform
  transform = {
    "(?:\\.mjs|codeSamples\\.js)$": [
      "babel-jest",
      {
        presets: [
          [
            "@babel/env",
            {
              targets: { node: "current" },
              exclude: [
                "transform-async-to-generator",
                "transform-classes",
                "proposal-async-generator-functions",
                "transform-regenerator",
              ],
            },
          ],
        ],
      },
    ],
  };
} else {
  // Only test bundles for production
  testPathIgnorePatterns.push(
    "<rootDir>/tests_integration/__tests__/bundle.js"
  );
}

module.exports = {
  setupFiles: ["<rootDir>/tests_config/setup.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns,
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "<rootDir>/bin/**/*.js"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/standalone.js",
    "<rootDir>/src/document/doc-debug.js",
  ],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier-local": "<rootDir>/tests_config/require_prettier.js",
    "prettier-standalone": "<rootDir>/tests_config/require_standalone.js",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/dist",
    "<rootDir>/website/static/lib",
    "<rootDir>/website/build/prettier/lib",
  ],
  testEnvironment: "node",
  transform,
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
