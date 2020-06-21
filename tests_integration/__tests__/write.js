"use strict";

const runPrettier = require("../runPrettier");

describe("write file with --write + unformatted file", () => {
  runPrettier("cli/write", ["--write", "unformatted.js"]).test({
    status: 0,
  });
});

describe("do not write file with --write + formatted file", () => {
  runPrettier("cli/write", ["--write", "formatted.js"]).test({
    write: [],
    status: 0,
  });
});

describe("do not write file with --write + invalid file", () => {
  runPrettier("cli/write", ["--write", "invalid.js"]).test({
    write: [],
    status: "non-zero",
  });
});
