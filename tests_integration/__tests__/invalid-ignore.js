"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("throw error with invalid ignore", () => {
  runPrettier("cli/invalid-ignore", ["something.js"]).test({
    status: "non-zero",
  });
});
