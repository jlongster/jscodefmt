"use strict";

const path = require("path");
const ignore = require("ignore");
const getFileContentOrNull = require("../utils/get-file-content-or-null");

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  const ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (ignorePath, withNodeModules) {
  const ignoreContent = !ignorePath
    ? null
    : getFileContentOrNull.sync(path.resolve(ignorePath));
  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {null | string} ignoreContent
 * @param {boolean?} withNodeModules
 */
function _createIgnorer(ignoreContent, withNodeModules) {
  const ignorer = ignore();

  if (ignoreContent) {
    ignorer.add(ignoreContent);
  }

  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
