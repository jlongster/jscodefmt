#!/usr/bin/env node

"use strict";

const { exec, execSync } = require("child_process");

async function run() {
  const chalk = require("chalk");
  const { string: outdentString } = require("outdent");
  const minimist = require("minimist");
  const semver = require("semver");

  const { readJson } = require("./utils");

  const params = minimist(process.argv.slice(2), {
    string: ["version"],
    boolean: ["dry"],
    alias: { v: "version" },
  });

  const previousVersion = execSync("git describe --tags --abbrev=0")
    .toString()
    .trim();

  if (semver.parse(previousVersion) === null) {
    throw new Error(`Unexpected previousVersion: ${previousVersion}`);
  } else {
    params.previousVersion = previousVersion;
    params.previousVersionOnMaster = (await readJson("package.json")).version;
  }

  const steps = [
    require("./steps/validate-new-version"),
    require("./steps/check-git-status"),
    require("./steps/install-dependencies"),
    require("./steps/run-tests"),
    require("./steps/update-version"),
    require("./steps/generate-bundles"),
    require("./steps/update-changelog"),
    require("./steps/push-to-git"),
    require("./steps/publish-to-npm"),
    require("./steps/bump-prettier"),
    require("./steps/update-dependents-count"),
    require("./steps/post-publish-steps"),
  ];

  try {
    for (const step of steps) {
      await step(params);
    }
  } catch (error) {
    const message = outdentString(error.message.trim());
    const stack = error.stack.replace(message, "");
    console.error(`${chalk.red("error")} ${message}\n${stack}`);
    process.exit(1);
  }
}

exec(
  [
    "git fetch --tags", // Fetch git tags to get the previous version number (i.e. the latest tag)
    "yarn install", // Install script's dependencies before any require
  ].join(" && "),
  { cwd: __dirname },
  (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    } else {
      run();
    }
  }
);
