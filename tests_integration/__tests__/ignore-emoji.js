"use strict";
const path = require("path");
const prettier = require("prettier/local");
const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("ignores file name contains emoji", () => {
  runPrettier("cli/ignore-emoji", ["**/*.js", "-l"]).test({
    status: 1,
  });
});

describe("stdin", () => {
  runPrettier(
    "cli/ignore-emoji",
    ["--stdin-filepath", "ignored/我的样式.css"],
    { input: ".name {                         display: none; }" }
  ).test({
    status: 0,
  });
});

test("API getFileInfo should ignore files contains emoji", async () => {
  await expect(
    prettier.getFileInfo(
      path.join(__dirname, "../cli/ignore-emoji/ignored/我的样式.css"),
      {
        ignorePath: path.join(__dirname, "../cli/ignore-emoji/.prettierignore"),
      }
    )
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});
