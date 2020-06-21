"use strict";

const { runYarn, logPromise } = require("../utils");

module.exports = async function () {
  await logPromise("Running linter", runYarn("lint:eslint"));
  await logPromise("Running Prettier on docs", runYarn("lint:prettier"));
  await logPromise("Running tests", runYarn("test"));
};
