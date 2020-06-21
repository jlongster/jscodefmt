"use strict";

const path = require("path");
const runPrettier = require("../runPrettier");

describe("support absolute filename", () => {
  runPrettier("cli/ignore-absolute-path", [
    path.resolve(__dirname, "../cli/ignore-absolute-path/ignored/module.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/depth1/ignored/*.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/regular-module.js"),
    "-l",
  ]).test({
    status: 1,
  });
});
