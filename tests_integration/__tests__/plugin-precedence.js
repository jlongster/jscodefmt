"use strict";

const runPrettier = require("../runPrettier");

describe("json-stringify takes precedence over json for package.json", () => {
  runPrettier("plugins", ["--stdin-filepath=package.json"], {
    input:
      '{ "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong" }',
  }).test({
    stdout:
      '{\n  "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong"\n}\n',
    stderr: "",
    status: 0,
    write: [],
  });
});
