"use strict";

const runPrettier = require("../runPrettier");

describe("preserves shebang", () => {
  runPrettier("cli/with-shebang", ["--end-of-line", "lf", "issue1890.js"]).test(
    {
      status: 0,
    }
  );
});
