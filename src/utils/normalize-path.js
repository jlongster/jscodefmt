"use strict";

const path = require("path");

const isWindows = path.sep === "\\";

module.exports = isWindows
  ? (path) => path.replace(/\\/g, "/")
  : (path) => path;
