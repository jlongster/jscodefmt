"use strict";

const path = require("path");
const fs = require("fs");
const runPrettier = require("../runPrettier");
const { projectRoot } = require("../env");

expect.addSnapshotSerializer(require("../path-serializer"));

// ESLint-like behavior
// https://github.com/prettier/prettier/pull/6639#issuecomment-548949954
//
// 1. `prettier dir1 dir2` – prettify all files with supported extensions inside `dir1` and `dir2`.
//
// 2. `prettier dir1 "dir2/**/*"` – prettify all files with supported extensions inside `dir1`
//     as well as all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//
// 3. `prettier non-exists-dir "dir2/**/*""` – log an error that `non-exists-dir` resulted in 0 files
//     and prettify all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//     (Note: ESLint just prints an error and doesn't process anything.)
//
// 4. `prettier . "dir2/**/*"` – prettify all files with supported extensions in `.`
//     and all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//
// (*) That error ("No parser could be inferred for file") doesn't affect the error code.

testPatterns("1", ["dir1", "dir2"]);
testPatterns("1a - with *.foo plugin", [
  "dir1",
  "dir2",
  "--plugin=../../plugins/extensions/plugin",
]);
testPatterns("1b - special characters in dir name", ["dir1", "!dir"], {
  stdout: expect.stringMatching(/!dir[/\\]a\.js/),
});
testPatterns("1c", ["dir1", "empty"], { status: 2 });

testPatterns("2", ["dir1", "dir2/**/*"], { status: 1 });

testPatterns("3", ["nonexistent-dir", "dir2/**/*"], { status: 2 });

testPatterns("4", [".", "dir2/**/*"], { status: 1 });

describe("Negative patterns", () => {
  testPatterns("1", ["dir1", "!dir1/nested1"]);
  testPatterns("1a", ["dir1", "!dir1/nested1/*"]);
  testPatterns("2", [".", "!dir1/nested1"]);
  testPatterns("3", [".", "!dir1/nested1/an1.js"]);
  testPatterns("4", ["!nonexistent-dir1 !nonexistent-dir2"], { status: 2 });
  testPatterns("with explicit files", ["dir1/a1.js", "dir2/a2.js", "!dir1/*"], {
    status: 2,
  });
});

testPatterns("Exclude yarn.lock when expanding directories", ["."], {
  stdout: expect.not.stringContaining("yarn.lock"),
});

const uppercaseRocksPlugin = path.join(
  projectRoot,
  "tests_config/prettier-plugins/prettier-plugin-uppercase-rocks"
);
describe("plugins `.`", () => {
  runPrettier("cli/dirs/plugins", [
    ".",
    "-l",
    "--plugin",
    uppercaseRocksPlugin,
  ]).test({
    write: [],
    stderr: "",
    status: 1,
  });
});
describe("plugins `*`", () => {
  runPrettier("cli/dirs/plugins", [
    "*",
    "-l",
    "--plugin",
    uppercaseRocksPlugin,
  ]).test({
    write: [],
    status: 1,
  });
});

if (path.sep === "/") {
  // Don't use snapshots in these tests as they're conditionally executed on non-Windows only.

  const base = path.resolve(__dirname, "../cli/patterns-dirs");

  // We can't commit these dirs without causing problems on Windows.

  // TODO: these should be moved to a `beforeAll`, but for that to be possible,
  // `runPrettier` should be refactored to use `describe` and `beforeEach` for doing setup.
  fs.mkdirSync(path.resolve(base, "test-a\\"));
  fs.writeFileSync(path.resolve(base, "test-a\\", "test.js"), "x");
  fs.mkdirSync(path.resolve(base, "test-b\\?"));
  fs.writeFileSync(path.resolve(base, "test-b\\?", "test.js"), "x");

  describe("Backslashes in names", () => {
    afterAll(() => {
      fs.unlinkSync(path.resolve(base, "test-a\\", "test.js"));
      fs.rmdirSync(path.resolve(base, "test-a\\"));
      fs.unlinkSync(path.resolve(base, "test-b\\?", "test.js"));
      fs.rmdirSync(path.resolve(base, "test-b\\?"));
    });

    testPatterns("", ["test-a\\/test.js"], { stdout: "test-a\\/test.js\n" });
    testPatterns("", ["test-a\\"], { stdout: "test-a\\/test.js\n" });
    testPatterns("", ["test-a*/*"], { stdout: "test-a\\/test.js\n" });

    testPatterns("", ["test-b\\?/test.js"], { stdout: "test-b\\?/test.js\n" });
    testPatterns("", ["test-b\\?"], { stdout: "test-b\\?/test.js\n" });
    testPatterns("", ["test-b*/*"], { stdout: "test-b\\?/test.js\n" });
  });
}

function testPatterns(namePrefix, cliArgs, expected = {}) {
  const testName = `${
    namePrefix ? `${namePrefix}: ` : ""
  }prettier ${cliArgs
    .map((arg) => (/^[\w./=-]+$/.test(arg) ? arg : `'${arg}'`))
    .join(" ")}`;

  describe(testName, () => {
    runPrettier("cli/patterns-dirs", [...cliArgs, "-l"]).test({
      write: [],
      ...(!("status" in expected) && { stderr: "", status: 1 }),
      ...expected,
    });
  });
}
