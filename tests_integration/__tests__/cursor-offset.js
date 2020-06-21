"use strict";

const runPrettier = require("../runPrettier");

describe("write cursorOffset to stderr with --cursor-offset <int>", () => {
  runPrettier("cli", ["--cursor-offset", "2", "--parser", "babel"], {
    input: " 1",
  }).test({
    status: 0,
  });
});

describe("cursorOffset should not be affected by full-width character", () => {
  runPrettier("cli", ["--cursor-offset", "21", "--parser", "babel"], {
    input:
      'const x = ["中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文"];',
    //                              ^ offset = 21                              ^ width = 80
  }).test({
    /**
     * const x = [
     *   "中文",
     *   "中文",
     *        ^ offset = 26
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文"
     * ];
     */
    stderr: "26\n",
    status: 0,
  });
});
