"use strict";

const execa = require("execa");
const { logPromise } = require("../utils");

async function pushGit({ version }) {
  await execa("git", ["commit", "-am", `Release ${version}`]);
  await execa("git", ["tag", "-a", version, "-m", `Release ${version}`]);
  await execa("git", ["push"]);
  await execa("git", ["push", "--tags"]);
}

module.exports = function (params) {
  if (params.dry) {
    return;
  }

  return logPromise("Committing and pushing to remote", pushGit(params));
};
