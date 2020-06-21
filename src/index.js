"use strict";

const { version } = require("../package.json");

const core = require("./main/core");
const { getSupportInfo } = require("./main/support");
const getFileInfo = require("./common/get-file-info");
const sharedUtil = require("./common/util-shared");
const plugins = require("./common/load-plugins");
const config = require("./config/resolve-config");
const doc = require("./document");

function _withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return (...args) => {
    const opts = args[optsArgIdx] || {};
    args[optsArgIdx] = {
      ...opts,
      plugins: plugins.loadPlugins(opts.plugins, opts.pluginSearchDirs),
    };
    return fn(...args);
  };
}

function withPlugins(fn, optsArgIdx) {
  const resultingFn = _withPlugins(fn, optsArgIdx);
  if (fn.sync) {
    // @ts-ignore
    resultingFn.sync = _withPlugins(fn.sync, optsArgIdx);
  }
  return resultingFn;
}

const formatWithCursor = withPlugins(core.formatWithCursor);

module.exports = {
  formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check(text, opts) {
    const { formatted } = formatWithCursor(text, opts);
    return formatted === text;
  },

  doc,

  resolveConfig: config.resolveConfig,
  resolveConfigFile: config.resolveConfigFile,
  clearConfigCache() {
    config.clearCache();
    plugins.clearCache();
  },

  getFileInfo: /** @type {typeof getFileInfo} */ (withPlugins(getFileInfo)),
  getSupportInfo: /** @type {typeof getSupportInfo} */ (withPlugins(
    getSupportInfo,
    0
  )),

  version,

  util: sharedUtil,

  // Internal shared
  __internal: {
    errors: require("./common/errors"),
    coreOptions: require("./main/core-options"),
    createIgnorer: require("./common/create-ignorer"),
    optionsModule: require("./main/options"),
    optionsNormalizer: require("./main/options-normalizer"),
    utils: {
      arrayify: require("./utils/arrayify"),
    },
  },

  /* istanbul ignore next */
  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString),
  },
};
