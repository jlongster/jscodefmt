"use strict";

const execa = require("execa");
const { logPromise } = require("../utils");

async function install() {
  await execa("rm", ["-rf", "node_modules"]);
  await execa("yarn", ["install"]);

  const status = await execa.stdout("git", ["ls-files", "-m"]);
  if (status) {
    throw new Error(
      "The lockfile needs to be updated, commit it before making the release."
    );
  }
}

module.exports = function () {
  return logPromise("Installing NPM dependencies", install());
};
