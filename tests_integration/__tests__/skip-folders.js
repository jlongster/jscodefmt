"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("skips folders in glob", () => {
  runPrettier("cli/skip-folders", ["**/*", "-l"]).test({
    status: 1,
    stderr: "",
  });
});

describe("skip folders passed specifically", () => {
  runPrettier("cli/skip-folders", [
    "a",
    "a/file.js",
    "b",
    "b/file.js",
    "-l",
  ]).test({ status: 1, stderr: "" });
});
