"use strict";

const chalk = require("chalk");
const fetch = require("node-fetch");
const execa = require("execa");
const { logPromise, processFile } = require("../utils");

async function update() {
  const npmPage = await logPromise(
    "Fetching npm dependents count",
    fetch("https://www.npmjs.com/package/prettier").then((response) =>
      response.text()
    )
  );
  const dependentsCountNpm = Number(
    npmPage.match(/"dependentsCount":(\d+),/)[1]
  );
  if (Number.isNaN(dependentsCountNpm)) {
    throw new TypeError(
      "Invalid data from https://www.npmjs.com/package/prettier"
    );
  }

  const githubPage = await logPromise(
    "Fetching github dependents count",
    fetch(
      "https://github.com/prettier/prettier/network/dependents"
    ).then((response) => response.text())
  );
  const dependentsCountGithub = Number(
    githubPage
      .replace(/\n/g, "")
      .match(
        /<svg.*?octicon-code-square.*?>.*?<\/svg>\s*([\d,]+?)\s*Repositories\s*<\/a>/
      )[1]
      .replace(/,/g, "")
  );
  if (Number.isNaN(dependentsCountNpm)) {
    throw new TypeError(
      "Invalid data from https://github.com/prettier/prettier/network/dependents"
    );
  }

  processFile("website/pages/en/index.js", (content) =>
    content
      .replace(
        /(<strong data-placeholder="dependent-npm">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountNpm)}$3`
      )
      .replace(
        /(<strong data-placeholder="dependent-github">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountGithub)}$3`
      )
  );

  const isUpdated = await logPromise(
    "Checking if dependents count has been updated",
    execa("git", ["diff", "--name-only"]).then(
      ({ stdout }) => stdout === "website/pages/en/index.js"
    )
  );

  if (isUpdated) {
    logPromise(
      "Committing and pushing to remote",
      (async () => {
        await execa("git", ["add", "."]);
        await execa("git", ["commit", "-m", "Update dependents count"]);
        await execa("git", ["push"]);
      })()
    );
  }
}

function formatNumber(value) {
  if (value < 1e4) {
    return String(value).slice(0, 1) + "0".repeat(String(value).length - 1);
  }
  if (value < 1e6) {
    return `${Math.floor(value / 1e2) / 10}k`;
  }
  return `${Math.floor(value / 1e5) / 10} million`;
}

module.exports = async function () {
  try {
    await update();
  } catch (error) {
    console.log(chalk.red.bold(error.message));
  }
};
