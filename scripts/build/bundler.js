"use strict";

const path = require("path");
const fs = require("fs");
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
const license = require("rollup-plugin-license");
const nativeShims = require("./rollup-plugins/native-shims");
const executable = require("./rollup-plugins/executable");
const evaluate = require("./rollup-plugins/evaluate");
const externals = require("./rollup-plugins/externals");

const PROJECT_ROOT = path.join(__dirname, "../..");

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
  // Avoid rollup `SOURCEMAP_ERROR` and `THIS_IS_UNDEFINED` error
  {
    find: "@glimmer/syntax",
    replacement: require.resolve("@glimmer/syntax"),
  },
  // https://github.com/rollup/plugins/issues/670
  {
    find: "is-core-module",
    replacement: require.resolve("is-core-module"),
  },
  {
    find: "yaml/util",
    replacement: require.resolve("yaml/util"),
  },
];

function webpackNativeShims(config, modules) {
  if (!config.resolve) {
    config.resolve = {};
  }
  const { resolve } = config;
  resolve.alias = resolve.alias || {};
  resolve.fallback = resolve.fallback || {};
  for (const module of modules) {
    if (module in resolve.alias || module in resolve.fallback) {
      throw new Error(`fallback/alias for "${module}" already exists.`);
    }
    const file = path.join(__dirname, `shims/${module}.mjs`);
    if (fs.existsSync(file)) {
      resolve.alias[module] = file;
    } else {
      resolve.fallback[module] = false;
    }
  }
  return config;
}

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

function getRollupConfig(bundle, options) {
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
      ignore:
        bundle.type === "plugin"
          ? undefined
          : (id) => /\.\/parser-.*?/.test(id),
      requireReturnsDefault: "preferred",
    }),
    externals(bundle.externals),
    bundle.target === "universal" && nodeGlobals(),
    babel(babelConfig),
    bundle.minify !== false &&
      bundle.target === "universal" &&
      terser({
        output: {
          ascii_only: true,
        },
      }),
    options.onLicenseFound &&
      license({
        cwd: PROJECT_ROOT,
        thirdParty: {
          includePrivate: true,
          output: options.onLicenseFound,
        },
      }),
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external = EXTERNALS;
  }

  return config;
}

function getRollupOutputOptions(bundle, buildOptions) {
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
        !buildOptions.playground && {
          ...options,
          format: "esm",
          file: `dist/esm/${bundle.output.replace(".js", ".mjs")}`,
        },
      ].filter(Boolean);
    }
    options.format = bundle.format;
  }

  if (buildOptions.playground && bundle.bundler !== "webpack") {
    return { skipped: true };
  }
  return [options];
}

function getWebpackConfig(bundle) {
  if (bundle.type !== "plugin" || bundle.target !== "universal") {
    throw new Error("Must use rollup for this bundle");
  }

  const root = path.resolve(__dirname, "..", "..");
  const config = {
    mode: "production",
    performance: { hints: false },
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
      library: {
        type: "umd",
        name: ["prettierPlugins", bundle.name],
      },
      // https://github.com/webpack/webpack/issues/6642
      globalObject: 'new Function("return this")()',
    },
    optimization: {},
    resolve: {
      // Webpack@5 can't resolve "postcss/lib/parser" and "postcss/lib/stringifier"" imported by `postcss-scss`
      // Ignore `exports` field to fix bundle script
      exportsFields: [],
    },
  };

  if (bundle.terserOptions) {
    const TerserPlugin = require("terser-webpack-plugin");
    config.optimization.minimizer = [new TerserPlugin(bundle.terserOptions)];
  }
  // config.optimization.minimize = false;

  return webpackNativeShims(config, ["os", "path", "util", "url", "fs"]);
}

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (stats.hasErrors()) {
        const { errors } = stats.toJson();
        const error = new Error(errors[0].message);
        error.errors = errors;
        reject(error);
        return;
      }

      if (stats.hasWarnings()) {
        const { warnings } = stats.toJson();
        console.warn(warnings);
      }

      resolve();
    });
  });
}

module.exports = async function createBundle(bundle, cache, options) {
  const inputOptions = getRollupConfig(bundle, options);
  const outputOptions = getRollupOutputOptions(bundle, options);

  if (!Array.isArray(outputOptions) && outputOptions.skipped) {
    return { skipped: true };
  }

  if (
    !options["purge-cache"] &&
    (
      await Promise.all(
        outputOptions.map((outputOption) =>
          cache.isCached(inputOptions, outputOption)
        )
      )
    ).every((cached) => cached)
  ) {
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
