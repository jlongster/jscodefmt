"use strict";

const runPrettier = require("../runPrettier");

describe("CLI overrides take precedence without --config-precedence", () => {
  runPrettier("cli/config/", [
    "--end-of-line",
    "lf",
    "--print-width",
    "1",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides take precedence with --config-precedence cli-override", () => {
  runPrettier("cli/config/", [
    "--end-of-line",
    "lf",
    "--print-width",
    "1",
    "--config-precedence",
    "cli-override",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides take lower precedence with --config-precedence file-override", () => {
  runPrettier("cli/config/js/", [
    "--end-of-line",
    "crlf",
    "--tab-width",
    "1",
    "--config-precedence",
    "file-override",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides are still applied when no config is found with --config-precedence file-override", () => {
  runPrettier("cli/config/no-config/", [
    "--end-of-line",
    "lf",
    "--tab-width",
    "6",
    "--config-precedence",
    "file-override",
    "**/*.js",
    "--no-editorconfig",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides gets ignored when config exists with --config-precedence prefer-file", () => {
  runPrettier("cli/config/js/", [
    "--print-width",
    "1",
    "--tab-width",
    "1",
    "--config-precedence",
    "prefer-file",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides gets applied when no config exists with --config-precedence prefer-file", () => {
  runPrettier("cli/config/no-config/", [
    "--end-of-line",
    "lf",
    "--print-width",
    "1",
    "--tab-width",
    "7",
    "--no-config",
    "--config-precedence",
    "prefer-file",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("CLI validate options with --config-precedence cli-override", () => {
  runPrettier("cli/config-precedence", [
    "--config-precedence",
    "cli-override",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI validate options with --config-precedence file-override", () => {
  runPrettier("cli/config-precedence", [
    "--config-precedence",
    "file-override",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI validate options with --config-precedence prefer-file", () => {
  runPrettier("cli/config-precedence", [
    "--config-precedence",
    "prefer-file",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI --stdin-filepath works with --config-precedence prefer-file", () => {
  runPrettier(
    "cli/config/",
    ["--stdin-filepath=abc.ts", "--no-semi", "--config-precedence=prefer-file"],
    { input: "let x: keyof Y = foo<typeof X>()" } // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});

describe("CLI --stdin-filepath works with --config-precedence file-override", () => {
  runPrettier(
    "cli/config/",
    [
      "--stdin-filepath=abc.ts",
      "--no-semi",
      "--config-precedence=file-override",
    ],
    { input: "let x: keyof Y = foo<typeof X>()" } // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});

describe("CLI --stdin-filepath works with --config-precedence cli-override", () => {
  runPrettier(
    "cli/config/",
    [
      "--stdin-filepath=abc.ts",
      "--no-semi",
      "--config-precedence=cli-override",
    ],
    { input: "let x: keyof Y = foo<typeof X>()" } // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});
