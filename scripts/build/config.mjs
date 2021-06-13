import path from "node:path";

/**
 * @typedef {Object} Bundle
 * @property {string} input - input of the bundle
 * @property {string?} output - path of the output file in the `dist/` folder
 * @property {string?} name - name for the UMD bundle (for plugins, it'll be `prettierPlugins.${name}`)
 * @property {'node' | 'universal'} target - should generate a CJS only for node or universal bundle
 * @property {'core' | 'plugin'} type - it's a plugin bundle or core part of prettier
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
      // `rollup-plugin-polyfill-node` don't have polyfill for these modules
      'require("perf_hooks")': "{}",
      'require("inspector")': "{}",
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
    terserOptions: {
      mangle: {
        // postcss need keep_fnames when minify
        keep_fnames: true,
        // we don't transform class anymore, so we need keep_classnames too
        keep_classnames: true,
      },
    },
    replace: {
      // `colorette`
      '"NO_COLOR" in process.env': "true",
    },
    // TODO[@fisker]: Enable minify
    minify: false,
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
].map((bundle) => ({
  type: "plugin",
  target: "universal",
  name: `prettierPlugins.${
    bundle.input.match(/parser-(?<name>.*?)\.js$/).groups.name
  }`,
  output: path.basename(bundle.input),
  ...bundle,
}));

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
