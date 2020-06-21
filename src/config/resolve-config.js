"use strict";

const thirdParty = require("../common/third-party");
const minimatch = require("minimatch");
const path = require("path");
const mem = require("mem");

const resolveEditorConfig = require("./resolve-config-editorconfig");
const loadToml = require("../utils/load-toml");
const resolve = require("../common/resolve");

const getExplorerMemoized = mem(
  (opts) => {
    const cosmiconfig = thirdParty["cosmiconfig" + (opts.sync ? "Sync" : "")];
    const explorer = cosmiconfig("prettier", {
      cache: opts.cache,
      transform: (result) => {
        if (result && result.config) {
          if (typeof result.config === "string") {
            const dir = path.dirname(result.filepath);
            const modulePath = resolve(result.config, { paths: [dir] });
            result.config = eval("require")(modulePath);
          }

          if (typeof result.config !== "object") {
            throw new Error(
              "Config is only allowed to be an object, " +
                `but received ${typeof result.config} in "${result.filepath}"`
            );
          }

          delete result.config.$schema;
        }
        return result;
      },
      searchPlaces: [
        "package.json",
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.yaml",
        ".prettierrc.yml",
        ".prettierrc.js",
        "prettier.config.js",
        ".prettierrc.toml",
      ],
      loaders: {
        ".toml": loadToml,
      },
    });

    return explorer;
  },
  { cacheKey: JSON.stringify }
);

/** @param {{ cache: boolean, sync: boolean }} opts */
function getExplorer(opts) {
  // Normalize opts before passing to a memoized function
  opts = { sync: false, cache: false, ...opts };
  return getExplorerMemoized(opts);
}

function _resolveConfig(filePath, opts, sync) {
  opts = { useCache: true, ...opts };
  const loadOpts = {
    cache: !!opts.useCache,
    sync: !!sync,
    editorconfig: !!opts.editorconfig,
  };
  const { load, search } = getExplorer(loadOpts);
  const loadEditorConfig = resolveEditorConfig.getLoadFunction(loadOpts);
  const arr = [
    opts.config ? load(opts.config) : search(filePath),
    loadEditorConfig(filePath),
  ];

  const unwrapAndMerge = ([result, editorConfigured]) => {
    const merged = {
      ...editorConfigured,
      ...mergeOverrides(result, filePath),
    };

    ["plugins", "pluginSearchDirs"].forEach((optionName) => {
      if (Array.isArray(merged[optionName])) {
        merged[optionName] = merged[optionName].map((value) =>
          typeof value === "string" && value.startsWith(".") // relative path
            ? path.resolve(path.dirname(result.filepath), value)
            : value
        );
      }
    });

    if (!result && !editorConfigured) {
      return null;
    }

    return merged;
  };

  if (loadOpts.sync) {
    return unwrapAndMerge(arr);
  }

  return Promise.all(arr).then(unwrapAndMerge);
}

const resolveConfig = (filePath, opts) => _resolveConfig(filePath, opts, false);

resolveConfig.sync = (filePath, opts) => _resolveConfig(filePath, opts, true);

function clearCache() {
  mem.clear(getExplorerMemoized);
  resolveEditorConfig.clearCache();
}

async function resolveConfigFile(filePath) {
  const { search } = getExplorer({ sync: false });
  const result = await search(filePath);
  return result ? result.filepath : null;
}

resolveConfigFile.sync = (filePath) => {
  const { search } = getExplorer({ sync: true });
  const result = search(filePath);
  return result ? result.filepath : null;
};

function mergeOverrides(configResult, filePath) {
  const { config, filepath: configPath } = configResult || {};
  const { overrides, ...options } = config || {};
  if (filePath && overrides) {
    const relativeFilePath = path.relative(path.dirname(configPath), filePath);
    for (const override of overrides) {
      if (
        pathMatchesGlobs(
          relativeFilePath,
          override.files,
          override.excludeFiles
        )
      ) {
        Object.assign(options, override.options);
      }
    }
  }

  return options;
}

// Based on eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-ops.js
function pathMatchesGlobs(filePath, patterns, excludedPatterns) {
  const patternList = [].concat(patterns);
  const excludedPatternList = [].concat(excludedPatterns || []);
  const opts = { matchBase: true, dot: true };

  return (
    patternList.some((pattern) => minimatch(filePath, pattern, opts)) &&
    !excludedPatternList.some((excludedPattern) =>
      minimatch(filePath, excludedPattern, opts)
    )
  );
}

module.exports = {
  resolveConfig,
  resolveConfigFile,
  clearCache,
};
