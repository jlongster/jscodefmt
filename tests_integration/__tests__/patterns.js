"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("multiple patterns", () => {
  runPrettier("cli/patterns", [
    "directory/**/*.js",
    "other-directory/**/*.js",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("multiple patterns with non exists pattern", () => {
  runPrettier("cli/patterns", [
    "directory/**/*.js",
    "non-existent.js",
    "-l",
  ]).test({
    status: 2,
  });
});

describe("multiple patterns with ignore nested directories pattern", () => {
  runPrettier("cli/patterns", [
    "**/*.js",
    "!**/nested-directory/**",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by default", () => {
  runPrettier("cli/patterns", ["**/*.js", "!directory/**", "-l"]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by with ./**/*.js", () => {
  runPrettier("cli/patterns", ["./**/*.js", "!./directory/**", "-l"]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, doesn't ignore node_modules with --with-node-modules flag", () => {
  runPrettier("cli/patterns", [
    "**/*.js",
    "!directory/**",
    "-l",
    "--with-node-modules",
  ]).test({
    status: 1,
  });
});

describe("no errors on empty patterns", () => {
  // --parser is mandatory if no filepath is passed
  runPrettier("cli/patterns", ["--parser", "babel"]).test({
    status: 0,
  });
});

describe("multiple patterns, throw error and exit with non zero code on non existing files", () => {
  runPrettier("cli/patterns", [
    "non-existent.js",
    "other-non-existent.js",
    "-l",
  ]).test({
    status: 2,
  });
});
