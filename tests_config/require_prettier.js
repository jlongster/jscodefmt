"use strict";

const isProduction = process.env.NODE_ENV === "production";
const prettierRootDir = isProduction ? process.env.PRETTIER_DIR : "..";

const prettier = require(prettierRootDir);

module.exports = prettier;
