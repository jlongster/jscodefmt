"use strict";

// eslint-disable-next-line no-restricted-modules
const { isCI } = require("../common/third-party");

// Some CI pipelines incorrectly report process.stdout.isTTY status,
// which causes unwanted lines in the output. An additional check for isCI() helps.
// See https://github.com/prettier/prettier/issues/5801
module.exports = function isTTY() {
  return process.stdout.isTTY && !isCI();
};
