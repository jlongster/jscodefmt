"use strict";

const fs = require("fs");
const path = require("path");

const editorconfig = require("editorconfig");
const mem = require("mem");
const editorConfigToPrettier = require("editorconfig-to-prettier");
const findProjectRoot = require("find-project-root");

const jsonStringifyMem = (fn) => mem(fn, { cacheKey: JSON.stringify });

const maybeParse = (filePath, parse) => {
  // findProjectRoot will throw an error if we pass a nonexistent directory to
  // it, which is possible, for example, when the path is given via
  // --stdin-filepath. So, first, traverse up until we find an existing
  // directory.
  let dirPath = path.dirname(path.resolve(filePath));
  const fsRoot = path.parse(dirPath).root;
  while (dirPath !== fsRoot && !fs.existsSync(dirPath)) {
    dirPath = path.dirname(dirPath);
  }
  const root = findProjectRoot(dirPath);
  return filePath && parse(filePath, { root });
};

const editorconfigAsyncNoCache = async (filePath) => {
  const editorConfig = await maybeParse(filePath, editorconfig.parse);
  return editorConfigToPrettier(editorConfig);
};
const editorconfigAsyncWithCache = jsonStringifyMem(editorconfigAsyncNoCache);

const editorconfigSyncNoCache = (filePath) => {
  return editorConfigToPrettier(maybeParse(filePath, editorconfig.parseSync));
};
const editorconfigSyncWithCache = jsonStringifyMem(editorconfigSyncNoCache);

function getLoadFunction(opts) {
  if (!opts.editorconfig) {
    return () => null;
  }

  if (opts.sync) {
    return opts.cache ? editorconfigSyncWithCache : editorconfigSyncNoCache;
  }

  return opts.cache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache;
}

function clearCache() {
  mem.clear(editorconfigSyncWithCache);
  mem.clear(editorconfigAsyncWithCache);
}

module.exports = {
  getLoadFunction,
  clearCache,
};
