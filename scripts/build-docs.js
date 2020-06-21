#!/usr/bin/env node

"use strict";

const path = require("path");
const shell = require("shelljs");

shell.config.fatal = true;

const rootDir = path.join(__dirname, "..");
const docs = path.join(rootDir, "website/static/lib");

function pipe(string) {
  return new shell.ShellString(string);
}

const isPullRequest = process.env.PULL_REQUEST === "true";
const prettierPath = isPullRequest ? "dist" : "node_modules/prettier";

shell.mkdir("-p", docs);

if (isPullRequest) {
  // --- Build prettier for PR ---
  const pkg = require("../package.json");
  const newPkg = { ...pkg, version: `999.999.999-pr.${process.env.REVIEW_ID}` };
  pipe(JSON.stringify(newPkg, null, 2)).to("package.json");
  shell.exec("yarn build");
  pipe(JSON.stringify(pkg, null, 2) + "\n").to("package.json"); // restore
}
shell.cp(`${prettierPath}/standalone.js`, `${docs}/`);
shell.cp(`${prettierPath}/parser-*.js`, `${docs}/`);

// --- Site ---
shell.cd("website");
shell.echo("Building website...");
shell.exec("yarn install");

shell.exec("yarn build");

shell.echo();
