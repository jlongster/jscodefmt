"use strict";

const runPrettier = require("../runPrettier");

describe("ignore path", () => {
  runPrettier("cli/ignore-path", [
    "**/*.js",
    "--ignore-path",
    ".gitignore",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("support .prettierignore", () => {
  runPrettier("cli/ignore-path", ["**/*.js", "-l"]).test({
    status: 1,
  });
});

describe("ignore file when using --debug-check", () => {
  runPrettier("cli/ignore-path", ["**/*.js", "--debug-check"]).test({
    status: 0,
  });
});

describe("outputs files as-is if no --write", () => {
  runPrettier("cli/ignore-path", ["regular-module.js"], {
    ignoreLineEndings: true,
  }).test({
    status: 0,
  });
});
