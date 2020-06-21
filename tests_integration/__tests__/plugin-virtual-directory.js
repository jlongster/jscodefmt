"use strict";

const runPrettier = require("../runPrettier");

describe("plugin search should not crash when prettier isn't inside a directory", () => {
  runPrettier(
    "plugins/virtualDirectory",
    ["--stdin-filepath", "example.js", "--plugin-search-dir=."],
    { input: "" }
  ).test({
    stdout: "",
    stderr: "",
    status: 0,
    write: [],
  });
});
