"use strict";
const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { prettierCli, isProduction, prettierRootDir } = require("../env");

describe("CLI", () => {
  test("CLI should be executable.", () => {
    expect(() => fs.accessSync(prettierCli, fs.constants.X_OK)).not.toThrow();
  });

  if (isProduction) {
    test("prefer local installation", async () => {
      const workingDirectory = path.join(prettierRootDir, "../..");
      const { version } = require(path.join(prettierRootDir, "package.json"));

      const binFilename = path.basename(prettierCli);
      const binFile = path.join(workingDirectory, binFilename);

      // copy bin file and deps
      for (const file of [
        binFilename,
        "index.js",
        "third-party.js",
        "package.json",
      ]) {
        let content = fs.readFileSync(path.join(prettierRootDir, file), "utf8");
        // Currently, the `prettier --version` output the version from `index.js`
        if (file === "index.js") {
          while (content.includes(version)) {
            content = content.replace(version, "global-version");
          }
        }
        fs.writeFileSync(path.join(workingDirectory, file), content);
      }

      expect(
        (
          await execa.node(binFile, ["--version"], {
            cwd: workingDirectory,
          })
        ).stdout
      ).toBe(version);

      // Remove `importLocal`
      fs.writeFileSync(
        binFile,
        fs
          .readFileSync(binFile, "utf8")
          .replace("importLocal(__filename)", "false")
      );

      expect(
        (
          await execa.node(binFile, ["--version"], {
            cwd: workingDirectory,
          })
        ).stdout
      ).toBe("global-version");
    });
  }
});
