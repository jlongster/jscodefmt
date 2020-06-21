"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("ignores files when executing in a subdirectory", () => {
  runPrettier("cli/ignore-in-subdirectories/web1", [
    "ignore-me/should-ignore.js",
    "--ignore-path",
    "../.prettierignore",
    "-l",
  ]).test({
    status: 0,
  });

  runPrettier("cli/ignore-in-subdirectories/web1", [
    "ignore-me/subdirectory/should-ignore.js",
    "--ignore-path",
    "../.prettierignore",
    "-l",
  ]).test({
    status: 0,
  });
});

describe("formats files when executing in a subdirectory", () => {
  runPrettier("cli/ignore-in-subdirectories/web1", [
    "should-not-ignore.js",
    "--ignore-path",
    "../.prettierignore",
    "-l",
  ]).test({
    status: 1,
  });

  runPrettier("cli/ignore-in-subdirectories/web2", [
    "should-not-ignore.js",
    "--ignore-path",
    "../.prettierignore",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("ignore files when executing in a subdirectory and using stdin", () => {
  runPrettier(
    "cli/ignore-in-subdirectories/web1",
    [
      "--ignore-path",
      "../.prettierignore",
      "--stdin-filepath",
      "ignore-me/example.js",
    ],
    {
      input: "hello_world( );",
    }
  ).test({
    stdout: "hello_world( );",
    status: 0,
  });
});

describe("formats files when executing in a subdirectory and using stdin", () => {
  runPrettier(
    "cli/ignore-in-subdirectories/web1",
    ["--ignore-path", "../.prettierignore", "--stdin-filepath", "example.js"],
    {
      input: "hello_world( );",
    }
  ).test({
    stdout: `hello_world();
`,
    status: 0,
  });
});
