"use strict";

/**
 * @typedef {import("../doc/doc-builders").Doc} Doc
 */

module.exports = {
  builders: require("./doc-builders"),
  printer: require("./doc-printer"),
  utils: require("./doc-utils"),
  debug: require("./doc-debug")
};
