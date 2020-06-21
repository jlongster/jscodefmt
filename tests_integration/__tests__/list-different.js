"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --list-different", () => {
  runPrettier("cli/with-shebang", ["--list-different", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero",
  });
});

describe("checks stdin with -l (alias for --list-different)", () => {
  runPrettier("cli/with-shebang", ["-l", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero",
  });
});

describe("--list-different works in CI just as in a non-TTY mode", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--list-different", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: true,
      ci: true,
    }
  ).test({
    status: 1,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--list-different", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: false,
    }
  ).test({
    status: 1,
  });

  expect(result0.stdout).toEqual(result1.stdout);
});
