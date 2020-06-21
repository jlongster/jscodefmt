"use strict";

const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const prettierRootDir = isProduction
  ? process.env.PRETTIER_DIR
  : path.join(__dirname, "..");
const { bin } = require(path.join(prettierRootDir, "package.json"));
const prettierCli = path.join(
  prettierRootDir,
  typeof bin === "object" ? bin.prettier : bin
);

const thirdParty = isProduction
  ? path.join(prettierRootDir, "./third-party")
  : path.join(prettierRootDir, "./src/common/third-party");

module.exports = {
  thirdParty,
  prettierCli,
};
