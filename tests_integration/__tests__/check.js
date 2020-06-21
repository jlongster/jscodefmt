"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --check", () => {
  runPrettier("cli/with-shebang", ["--check", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero",
  });
});

describe("checks stdin with -c (alias for --check)", () => {
  runPrettier("cli/with-shebang", ["-c", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero",
  });
});

describe("--checks works in CI just as in a non-TTY mode", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--check", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: true,
      ci: true,
    }
  ).test({
    status: 1,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--check", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: false,
    }
  ).test({
    status: 1,
  });

  expect(result0.stdout).toEqual(result1.stdout);
});
