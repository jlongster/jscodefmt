import path from "node:path";

/**
 * @typedef {Object} Bundle
 * @property {string} input - input of the bundle
 * @property {string?} output - path of the output file in the `dist/` folder
 * @property {string?} name - name for the UMD bundle (for plugins, it'll be `prettierPlugins.${name}`)
 * @property {'node' | 'universal'} target - should generate a CJS only for node or universal bundle
 * @property {'core' | 'plugin'} type - it's a plugin bundle or core part of prettier
 * @property {'rollup' | 'webpack'} [bundler='rollup'] - define which bundler to use
 * @property {CommonJSConfig} [commonjs={}] - options for `rollup-plugin-commonjs`
 * @property {string[]} external - array of paths that should not be included in the final bundle
 * @property {Object.<string, string | {code: string}>} replaceModule - module replacement path or code
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
    input: "src/language-js/parse/babel.js",
  },
  {
    input: "src/language-js/parse/flow.js",
    replace: {
      // `flow-parser` use this for `globalThis`, can't work in strictMode
      "(function(){return this}())": '(new Function("return this")())',
    },
  },
  {
    input: "src/language-js/parse/typescript.js",
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
      // `rollup-plugin-polyfill-node` don't have polyfill for these modules
      'require("perf_hooks")': "{}",
      'require("inspector")': "{}",
      // Dynamic `require()`s
      "ts.sys && ts.sys.require": "false",
      "require(etwModulePath)": "undefined",
      'require("source-map-support").install()': "",
      "require(modulePath)": "undefined",
    },
  },
  {
    input: "src/language-js/parse/espree.js",
  },
  {
    input: "src/language-js/parse/meriyah.js",
  },
  {
    input: "src/language-js/parse/angular.js",
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
].map((bundle) => {
  const { name } = bundle.input.match(
    /(?:parser-|parse\/)(?<name>.*?)\.js$/
  ).groups;

  return {
    type: "plugin",
    target: "universal",
    name: `prettierPlugins.${name}`,
    output: `parser-${name}.js`,
    ...bundle,
  };
});

/** @type {Bundle[]} */
const coreBundles = [
  {
    input: "src/index.js",
    replace: {
      // from @iarna/toml/parse-string
      "eval(\"require('util').inspect\")": "require('util').inspect",
    },
  },
  {
    input: "src/document/index.js",
    name: "doc",
    output: "doc.js",
    target: "universal",
    format: "umd",
    minify: false,
  },
  {
    input: "src/standalone.js",
    name: "prettier",
    target: "universal",
  },
  {
    input: "bin/prettier.js",
    output: "bin-prettier.js",
    external: ["benchmark"],
  },
  {
    input: "src/common/third-party.js",
    replace: {
      // cosmiconfig@6 -> import-fresh can't find parentModule, since module is bundled
      "parentModule(__filename)": "__filename",
    },
  },
].map((bundle) => ({
  type: "core",
  target: "node",
  output: path.basename(bundle.input),
  ...bundle,
}));

export default [...coreBundles, ...parsers];
