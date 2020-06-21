"use strict";

const execa = require("execa");
const path = require("path");
const { rollup } = require("rollup");
const webpack = require("webpack");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const rollupPluginAlias = require("@rollup/plugin-alias");
const commonjs = require("@rollup/plugin-commonjs");
const nodeGlobals = require("rollup-plugin-node-globals");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const { terser } = require("rollup-plugin-terser");
const { babel } = require("@rollup/plugin-babel");
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
  // `handlebars` causes webpack warning by using `require.extensions`
  // `dist/handlebars.js` also complaint on `window` variable
  // use cjs build instead
  // https://github.com/prettier/prettier/issues/6656
  {
    find: "handlebars",
    replacement: require.resolve("handlebars/dist/cjs/handlebars.js"),
  },
  {
    find: "@angular/compiler/src",
    replacement: path.resolve(
      `${PROJECT_ROOT}/node_modules/@angular/compiler/esm2015/src`
    ),
  },
];

function getBabelConfig(bundle) {
  const config = {
    babelrc: false,
    plugins: bundle.babelPlugins || [],
    compact: bundle.type === "plugin" ? false : "auto",
  };
  if (bundle.type === "core") {
    config.plugins.push(
      require.resolve("./babel-plugins/transform-custom-require")
    );
  }
  const targets = { node: "10" };
  if (bundle.target === "universal") {
    targets.browsers = [
      ">0.5%",
      "not ie 11",
      "not safari 5.1",
      "not op_mini all",
    ];
  }
  config.presets = [
    [
      require.resolve("@babel/preset-env"),
      {
        targets,
        exclude: ["transform-async-to-generator"],
        modules: false,
      },
    ],
  ];
  config.plugins.push([
    require.resolve("@babel/plugin-proposal-object-rest-spread"),
    { loose: true, useBuiltIns: true },
  ]);
  return config;
}

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

  const babelConfig = { babelHelpers: "bundled", ...getBabelConfig(bundle) };

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
    }),
    externals(bundle.externals),
    bundle.target === "universal" && nodeGlobals(),
    babel(babelConfig),
    bundle.minify !== false && bundle.target === "universal" && terser(),
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external = EXTERNALS;
  }

  return config;
}

function getRollupOutputOptions(bundle) {
  const options = {
    file: `dist/${bundle.output}`,
    strict: typeof bundle.strict === "undefined" ? true : bundle.strict,
  };

  if (bundle.target === "node") {
    options.format = "cjs";
  } else if (bundle.target === "universal") {
    options.format = "umd";
    options.name =
      bundle.type === "plugin" ? `prettierPlugins.${bundle.name}` : bundle.name;
  }
  return options;
}

function getWebpackConfig(bundle) {
  if (bundle.type !== "plugin" || bundle.target !== "universal") {
    throw new Error("Must use rollup for this bundle");
  }

  const root = path.resolve(__dirname, "..", "..");
  const config = {
    entry: path.resolve(root, bundle.input),
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            options: getBabelConfig(bundle),
          },
        },
      ],
    },
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

module.exports = async function createBundle(bundle, cache) {
  const inputOptions = getRollupConfig(bundle);
  const outputOptions = getRollupOutputOptions(bundle);

  const useCache = await cache.checkBundle(
    bundle.output,
    inputOptions,
    outputOptions
  );
  if (useCache) {
    try {
      await execa("cp", [
        path.join(cache.cacheDir, "files", bundle.output),
        "dist",
      ]);
      return { cached: true };
    } catch (err) {
      // Proceed to build
    }
  }

  if (bundle.bundler === "webpack") {
    await runWebpack(getWebpackConfig(bundle));
  } else {
    const result = await rollup(inputOptions);
    await result.write(outputOptions);
  }

  return { bundled: true };
};
