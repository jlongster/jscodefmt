"use strict";

const runPrettier = require("../runPrettier");

describe("boolean flags do not swallow the next argument", () => {
  runPrettier("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "--single-quote",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("negated options work", () => {
  runPrettier("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "--no-semi",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("unknown options are warned", () => {
  runPrettier("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "file.js",
    "--unknown",
  ]).test({
    status: 0,
  });
});

describe("unknown negated options are warned", () => {
  runPrettier("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "file.js",
    "--no-unknown",
  ]).test({
    status: 0,
  });
});

describe("allow overriding flags", () => {
  runPrettier(
    "cli/arg-parsing",
    ["--tab-width=1", "--tab-width=3", "--parser=babel"],
    { input: "function a() { b }" }
  ).test({
    stdout: "function a() {\n   b;\n}\n",
    status: 0,
  });
});
