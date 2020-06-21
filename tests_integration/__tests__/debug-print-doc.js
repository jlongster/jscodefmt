"use strict";

const runPrettier = require("../runPrettier");

describe("prints doc with --debug-print-doc", () => {
  runPrettier("cli/with-shebang", ["--debug-print-doc", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: '["0", ";", hardline, breakParent];\n',
    stderr: "",
    status: 0,
  });
});
