"use strict";

const path = require("path");
const execa = require("execa");
const { rollup } = require("rollup");
const webpack = require("webpack");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const rollupPluginAlias = require("@rollup/plugin-alias");
const commonjs = require("@rollup/plugin-commonjs");
const nodeGlobals = require("rollup-plugin-node-globals");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const { terser } = require("rollup-plugin-terser");
const nativeShims = require("./rollup-plugins/native-shims");
const executable = require("./rollup-plugins/executable");
const evaluate = require("./rollup-plugins/evaluate");
const externals = require("./rollup-plugins/externals");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const EXTERNALS = [
  "assert",
  "buffer",
  "constants",
  "crypto",
  "events",
  "fs",
  "module",
  "os",
  "path",
  "stream",
  "url",
  "util",
  "readline",
  "tty",
];

const entries = [
  // Force using the CJS file, instead of ESM; i.e. get the file
  // from `"main"` instead of `"module"` (rollup default) of package.json
  {
    find: "outdent",
    replacement: require.resolve("outdent"),
  },
  {
    find: "lines-and-columns",
    replacement: require.resolve("lines-and-columns"),
  },
  {
    find: "@angular/compiler/src",
    replacement: path.resolve(
      `${PROJECT_ROOT}/node_modules/@angular/compiler/esm2015/src`
    ),
  },
];

function getRollupConfig(bundle) {
  const config = {
    input: bundle.input,

    onwarn(warning) {
      if (
        // We use `eval("require")` to enable dynamic requires in the
        // custom parser API
        warning.code === "EVAL" ||
        // ignore `MIXED_EXPORTS` warn
        warning.code === "MIXED_EXPORTS" ||
        (warning.code === "CIRCULAR_DEPENDENCY" &&
          warning.importer.startsWith("node_modules"))
      ) {
        return;
      }

      // web bundle can't have external requires
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        bundle.target === "universal"
      ) {
        throw new Error(
          `Unresolved dependency in universal bundle: ${warning.source}`
        );
      }

      console.warn(warning);
    },
  };

  const replaceStrings = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };
  if (bundle.target === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceStrings["process.env.PRETTIER_DEBUG"] = "global.PRETTIER_DEBUG";
    // `rollup-plugin-node-globals` replace `__dirname` with the real dirname
    // `parser-typescript.js` will contain a path of working directory
    // See #8268
    replaceStrings.__filename = JSON.stringify(
      "/prettier-security-filename-placeholder.js"
    );
    replaceStrings.__dirname = JSON.stringify(
      "/prettier-security-dirname-placeholder"
    );
  }
  Object.assign(replaceStrings, bundle.replace);

  const alias = { ...bundle.alias };
  alias.entries = [...entries, ...(alias.entries || [])];

  config.plugins = [
    replace({
      values: replaceStrings,
      delimiters: ["", ""],
    }),
    executable(),
    evaluate(),
    json(),
    rollupPluginAlias(alias),
    bundle.target === "universal" &&
      nativeShims(path.resolve(__dirname, "shims")),
    nodeResolve({
      extensions: [".js", ".json"],
      preferBuiltins: bundle.target === "node",
    }),
    commonjs({
      ignoreGlobal: bundle.target === "node",
      ...bundle.commonjs,
      ignore:
        bundle.type === "plugin"
          ? undefined
          : (id) => /\.\/parser-.*?/.test(id),
      requireReturnsDefault: "preferred",
    }),
    externals(bundle.externals),
    bundle.target === "universal" && nodeGlobals(),
    bundle.minify !== false &&
      bundle.target === "universal" &&
      terser({
        output: {
          ascii_only: true,
        },
      }),
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external = EXTERNALS;
  }

  return config;
}

function getRollupOutputOptions(bundle) {
  const options = {
    // Avoid warning form #8797
    exports: "auto",
    file: `dist/${bundle.output}`,
  };

  if (bundle.target === "node") {
    options.format = "cjs";
  } else if (bundle.target === "universal") {
    options.name =
      bundle.type === "plugin" ? `prettierPlugins.${bundle.name}` : bundle.name;

    if (!bundle.format && bundle.bundler !== "webpack") {
      return [
        {
          ...options,
          format: "umd",
        },
        {
          ...options,
          format: "esm",
          file: `dist/esm/${bundle.output.replace(".js", ".mjs")}`,
        },
      ];
    }
    options.format = bundle.format;
  }
  return [options];
}

function getWebpackConfig(bundle) {
  if (bundle.type !== "plugin" || bundle.target !== "universal") {
    throw new Error("Must use rollup for this bundle");
  }

  const root = path.resolve(__dirname, "..", "..");
  const config = {
    entry: path.resolve(root, bundle.input),
    output: {
      path: path.resolve(root, "dist"),
      filename: bundle.output,
      library: ["prettierPlugins", bundle.name],
      libraryTarget: "umd",
      // https://github.com/webpack/webpack/issues/6642
      globalObject: 'new Function("return this")()',
    },
  };

  if (bundle.terserOptions) {
    const TerserPlugin = require("terser-webpack-plugin");

    config.optimization = {
      minimizer: [new TerserPlugin(bundle.terserOptions)],
    };
  }

  return config;
}

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function checkCache(cache, inputOptions, outputOption) {
  const useCache = await cache.checkBundle(
    outputOption.file,
    inputOptions,
    outputOption
  );

  if (useCache) {
    try {
      await execa("cp", [
        path.join(cache.cacheDir, outputOption.file.replace("dist", "files")),
        outputOption.file,
      ]);
      return true;
    } catch (err) {
      console.log(err);
      // Proceed to build
    }
  }

  return false;
}

module.exports = async function createBundle(bundle, cache) {
  const inputOptions = getRollupConfig(bundle);
  const outputOptions = getRollupOutputOptions(bundle);

  const checkCacheResults = await Promise.all(
    outputOptions.map((outputOption) =>
      checkCache(cache, inputOptions, outputOption)
    )
  );
  if (checkCacheResults.every((r) => r === true)) {
    return { cached: true };
  }

  if (bundle.bundler === "webpack") {
    await runWebpack(getWebpackConfig(bundle));
  } else {
    const result = await rollup(inputOptions);
    await Promise.all(outputOptions.map((option) => result.write(option)));
  }

  return { bundled: true };
};
