"use strict";

const path = require("path");
const ignore = require("ignore");
const options = require("../main/options");
const config = require("../config/resolve-config");
const createIgnorer = require("./create-ignorer");

/**
 * @typedef {{ ignorePath?: string, withNodeModules?: boolean, plugins: object }} FileInfoOptions
 * @typedef {{ ignored: boolean, inferredParser: string | null }} FileInfoResult
 */

/**
 * @param {string} filePath
 * @param {FileInfoOptions} opts
 * @returns {Promise<FileInfoResult>}
 *
 * Please note that prettier.getFileInfo() expects opts.plugins to be an array of paths,
 * not an object. A transformation from this array to an object is automatically done
 * internally by the method wrapper. See withPlugins() in index.js.
 */
async function getFileInfo(filePath, opts) {
  if (typeof filePath !== "string") {
    throw new TypeError(
      `expect \`filePath\` to be a string, got \`${typeof filePath}\``
    );
  }

  const ignorer = await createIgnorer(opts.ignorePath, opts.withNodeModules);
  return _getFileInfo({
    ignorer,
    filePath,
    plugins: opts.plugins,
    resolveConfig: opts.resolveConfig,
    ignorePath: opts.ignorePath,
    sync: false,
  });
}

/**
 * @param {string} filePath
 * @param {FileInfoOptions} opts
 * @returns {FileInfoResult}
 */
getFileInfo.sync = function (filePath, opts) {
  if (typeof filePath !== "string") {
    throw new TypeError(
      `expect \`filePath\` to be a string, got \`${typeof filePath}\``
    );
  }

  const ignorer = createIgnorer.sync(opts.ignorePath, opts.withNodeModules);
  return _getFileInfo({
    ignorer,
    filePath,
    plugins: opts.plugins,
    resolveConfig: opts.resolveConfig,
    ignorePath: opts.ignorePath,
    sync: true,
  });
};

function getFileParser(resolvedConfig, filePath, plugins) {
  if (resolvedConfig && resolvedConfig.parser) {
    return resolvedConfig.parser;
  }

  const inferredParser = options.inferParser(filePath, plugins);

  if (inferredParser) {
    return inferredParser;
  }

  return null;
}

function _getFileInfo({
  ignorer,
  filePath,
  plugins,
  resolveConfig = false,
  ignorePath,
  sync = false,
}) {
  const normalizedFilePath = normalizeFilePath(filePath, ignorePath);

  const fileInfo = {
    ignored:
      ignore.isPathValid(normalizedFilePath) &&
      ignorer.ignores(normalizedFilePath),
    inferredParser: null,
  };

  if (fileInfo.ignored) {
    return fileInfo;
  }

  let resolvedConfig;

  if (resolveConfig) {
    if (sync) {
      resolvedConfig = config.resolveConfig.sync(filePath);
    } else {
      return config.resolveConfig(filePath).then((resolvedConfig) => {
        fileInfo.inferredParser = getFileParser(
          resolvedConfig,
          filePath,
          plugins
        );
        return fileInfo;
      });
    }
  }

  fileInfo.inferredParser = getFileParser(resolvedConfig, filePath, plugins);
  return fileInfo;
}

function normalizeFilePath(filePath, ignorePath) {
  return path.relative(
    ignorePath ? path.dirname(ignorePath) : process.cwd(),
    filePath
  );
}

module.exports = getFileInfo;
