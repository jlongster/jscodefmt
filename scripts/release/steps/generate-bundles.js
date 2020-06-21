"use strict";

const chalk = require("chalk");
const { runYarn, logPromise, readJson } = require("../utils");

module.exports = async function ({ version }) {
  await logPromise("Generating bundles", runYarn(["build", "--purge-cache"]));

  const builtPkg = await readJson("dist/package.json");
  if (builtPkg.version !== version) {
    throw new Error(
      `Expected ${version} in dist/package.json but found ${builtPkg.version}`
    );
  }

  await logPromise("Running tests on generated bundles", runYarn("test:dist"));

  console.log(chalk.green.bold("Build successful!\n"));
};
