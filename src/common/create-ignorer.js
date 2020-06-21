"use strict";

const ignore = require("ignore");
const path = require("path");
const getFileContentOrNull = require("../utils/get-file-content-or-null");

/**
 * @param {undefined | string} ignorePath
 * @param {undefined | boolean} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  const ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {undefined | string} ignorePath
 * @param {undefined | boolean} withNodeModules
 */
createIgnorer.sync = function (ignorePath, withNodeModules) {
  const ignoreContent = !ignorePath
    ? null
    : getFileContentOrNull.sync(path.resolve(ignorePath));
  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {null | string} ignoreContent
 * @param {undefined | boolean} withNodeModules
 */
function _createIgnorer(ignoreContent, withNodeModules) {
  const ignorer = ignore().add(ignoreContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
