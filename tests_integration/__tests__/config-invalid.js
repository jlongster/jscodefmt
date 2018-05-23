"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("throw error with invalid config format", () => {
  runPrettier("cli/config/invalid", ["--config", "file/.prettierrc"]).test({
    status: "non-zero"
  });
});

describe("throw error with invalid config target (directory)", () => {
  runPrettier("cli/config/invalid", [
    "--config",
    "folder/.prettierrc" // this is a directory
  ]).test({
    status: "non-zero"
  });
});

describe("throw error with invalid config option (int)", () => {
  runPrettier("cli/config/invalid", ["--config", "option/int"]).test({
    status: "non-zero"
  });
});

describe("throw error with invalid config option (trailingComma)", () => {
  runPrettier("cli/config/invalid", ["--config", "option/trailingComma"]).test({
    status: "non-zero"
  });
});

describe("throw error with invalid config precedence option (configPrecedence)", () => {
  runPrettier("cli/config/invalid", [
    "--config-precedence",
    "option/configPrecedence"
  ]).test({
    status: "non-zero"
  });
});

// Tests below require --parser to prevent an error (no parser/filepath specified)

describe("show warning with unknown option", () => {
  runPrettier("cli/config/invalid", [
    "--config",
    "option/unknown",
    "--parser",
    "babylon"
  ]).test({
    status: 0
  });
});

describe("show warning with kebab-case option key", () => {
  runPrettier("cli/config/invalid", [
    "--config",
    "option/kebab-case",
    "--parser",
    "babylon"
  ]).test({
    status: 0
  });
});
