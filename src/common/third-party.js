"use strict";

module.exports = {
  cosmiconfig: require("cosmiconfig").cosmiconfig,
  cosmiconfigSync: require("cosmiconfig").cosmiconfigSync,
  findParentDir: require("find-parent-dir").sync,
  getStream: require("get-stream"),
  isCI: () => require("ci-info").isCI,
};
