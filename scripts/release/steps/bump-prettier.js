"use strict";

const fs = require("fs");
const execa = require("execa");
const semver = require("semver");
const { logPromise, readJson, writeJson } = require("../utils");

async function format() {
  await execa("yarn", ["lint:eslint", "--fix"]);
  await execa("yarn", ["lint:prettier", "--write"]);
}

async function commit(version) {
  await execa("git", [
    "commit",
    "-am",
    `Bump Prettier dependency to ${version}`,
  ]);

  // Add rev to `.git-blame-ignore-revs` file
  const file = ".git-blame-ignore-revs";
  const mark = "# Prettier bump after release";
  const rev = await execa.stdout("git", ["rev-parse", "HEAD"]);
  let text = fs.readFileSync(file, "utf8");
  text = text.replace(mark, `${mark}\n# ${version}\n${rev}`);
  fs.writeFileSync(file, text);
  await execa("git", ["commit", "-am", `Git blame ignore ${version}`]);

  await execa("git", ["push"]);
}

async function bump({
  version,
  previousVersion,
  previousVersionOnDefaultBranch,
}) {
  const pkg = await readJson("package.json");
  if (semver.diff(version, previousVersion) === "patch") {
    pkg.version = previousVersionOnDefaultBranch; // restore the `-dev` version
  } else {
    pkg.version = `${semver.inc(version, "minor")}-dev`;
  }
  await writeJson("package.json", pkg, { spaces: 2 });
}

module.exports = async function (params) {
  const { dry, version } = params;

  if (dry) {
    return;
  }

  await logPromise(
    "Installing Prettier",
    execa("yarn", ["add", "--dev", `prettier@${version}`])
  );

  await logPromise("Updating files", format());
  await logPromise("Bump default branch version", bump(params));
  await logPromise("Committing changed files", commit(version));
};
