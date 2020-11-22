"use strict";

const path = require("path");

/**
 * @typedef {Object} Bundle
 * @property {string} input - input of the bundle
 * @property {string?} output - path of the output file in the `dist/` folder
 * @property {string?} name - name for the UMD bundle (for plugins, it'll be `prettierPlugins.${name}`)
 * @property {'node' | 'universal'} target - should generate a CJS only for node or universal bundle
 * @property {'core' | 'plugin'} type - it's a plugin bundle or core part of prettier
 * @property {'rollup' | 'webpack'} [bundler='rollup'] - define which bundler to use
 * @property {CommonJSConfig} [commonjs={}] - options for `rollup-plugin-commonjs`
 * @property {string[]} externals - array of paths that should not be included in the final bundle
 * @property {Object.<string, string>} replace - map of strings to replace when processing the bundle
 * @property {string[]} babelPlugins - babel plugins
 * @property {Object?} terserOptions - options for `terser`
 * @property {boolean?} minify - minify

 * @typedef {Object} CommonJSConfig
 * @property {string[]} ignore - paths of CJS modules to ignore
 */

/** @type {Bundle[]} */
const parsers = [
  {
    input: "src/language-js/parser-babel.js",
  },
  {
    input: "src/language-js/parser-flow.js",
    replace: {
      // `flow-parser` use this for `globalThis`, can't work in strictMode
      "(function(){return this}())": '(new Function("return this")())',
    },
  },
  {
    input: "src/language-js/parser-typescript.js",
    replace: {
      // `typescript/lib/typescript.js` expose extra global objects
      // `TypeScript`, `toolsVersion`, `globalThis`
      'typeof process === "undefined" || process.browser': "false",
      'typeof globalThis === "object"': "true",
      // `@typescript-eslint/typescript-estree` v4
      'require("globby")': "{}",
      "extra.projects = prepareAndTransformProjects(":
        "extra.projects = [] || prepareAndTransformProjects(",
      "process.versions.node": "'999.999.999'",
      // `typescript/lib/tsc.js` and `typescript/lib/tsserver.js` try to use pnpApi
      "process.versions.pnp": "false",
      'require("pnpapi")': "{}",
    },
  },
  {
    input: "src/language-js/parser-espree.js",
  },
  {
    input: "src/language-js/parser-meriyah.js",
  },
  {
    input: "src/language-js/parser-angular.js",
  },
  {
    input: "src/language-css/parser-postcss.js",
    // postcss has dependency cycles that don't work with rollup
    bundler: "webpack",
    terserOptions: {
      // prevent terser generate extra .LICENSE file
      extractComments: false,
      terserOptions: {
        // prevent U+FFFE in the output
        output: {
          ascii_only: true,
        },
        mangle: {
          // postcss need keep_fnames when minify
          keep_fnames: true,
          // we don't transform class anymore, so we need keep_classnames too
          keep_classnames: true,
        },
      },
    },
  },
  {
    input: "dist/parser-postcss.js",
    output: "esm/parser-postcss.mjs",
    format: "esm",
  },
  {
    input: "src/language-graphql/parser-graphql.js",
  },
  {
    input: "src/language-markdown/parser-markdown.js",
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
    commonjs: {
      ignore: ["source-map"],
    },
  },
  {
    input: "src/language-html/parser-html.js",
  },
  {
    input: "src/language-yaml/parser-yaml.js",
  },
].map((parser) => ({
  type: "plugin",
  target: "universal",
  name: getFileOutput(parser).replace(/\.js$/, "").split("-")[1],
  ...parser,
}));

/** @type {Bundle[]} */
const coreBundles = [
  {
    input: "index.js",
    type: "core",
    target: "node",
    externals: [path.resolve("src/common/third-party.js")],
    replace: {
      // from @iarna/toml/parse-string
      "eval(\"require('util').inspect\")": "require('util').inspect",
    },
  },
  {
    input: "src/document/index.js",
    name: "doc",
    type: "core",
    output: "doc.js",
    target: "universal",
    format: "umd",
    minify: false,
  },
  {
    input: "standalone.js",
    name: "prettier",
    type: "core",
    target: "universal",
    // TODO: Find a better way to remove parsers
    replace: Object.fromEntries(
      parsers.map(({ name }) => [`require("./parser-${name}")`, "({})"])
    ),
  },
  {
    input: "bin/prettier.js",
    type: "core",
    output: "bin-prettier.js",
    target: "node",
    externals: [
      path.resolve("src/index.js"),
      path.resolve("src/common/third-party.js"),
    ],
  },
  {
    input: "src/common/third-party.js",
    type: "core",
    target: "node",
    replace: {
      // cosmiconfig@5 -> import-fresh uses `require` to resolve js config, which caused Error:
      // Dynamic requires are not currently supported by rollup-plugin-commonjs.
      "require(filePath)": "eval('require')(filePath)",
      "parent.eval('require')(filePath)": "parent.require(filePath)",
      "require.cache": "eval('require').cache",
      // cosmiconfig@6 -> import-fresh can't find parentModule, since module is bundled
      "parentModule(__filename)": "__filename",
    },
  },
];

function getFileOutput(bundle) {
  return bundle.output || path.basename(bundle.input);
}

module.exports = coreBundles.concat(parsers).map((bundle) => ({
  ...bundle,
  output: getFileOutput(bundle),
}));
