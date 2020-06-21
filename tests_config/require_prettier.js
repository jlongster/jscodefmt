"use strict";

const prettierRootDir = process.env.PRETTIER_DIR || "../";

const prettier = require(prettierRootDir);

module.exports = prettier;
