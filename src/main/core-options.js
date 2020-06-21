"use strict";

const { outdent } = require("outdent");

const CATEGORY_CONFIG = "Config";
const CATEGORY_EDITOR = "Editor";
const CATEGORY_FORMAT = "Format";
const CATEGORY_OTHER = "Other";
const CATEGORY_OUTPUT = "Output";
const CATEGORY_GLOBAL = "Global";
const CATEGORY_SPECIAL = "Special";

/**
 * @typedef {Object} OptionInfo
 * @property {string} [since] - available since version
 * @property {string} category
 * @property {'int' | 'boolean' | 'choice' | 'path'} type
 * @property {boolean} [array] - indicate it's an array of the specified type
 * @property {OptionValueInfo} [default]
 * @property {OptionRangeInfo} [range] - for type int
 * @property {string} description
 * @property {string} [deprecated] - deprecated since version
 * @property {OptionRedirectInfo} [redirect] - redirect deprecated option
 * @property {(value: any) => boolean} [exception]
 * @property {OptionChoiceInfo[]} [choices] - for type choice
 * @property {string} [cliName]
 * @property {string} [cliCategory]
 * @property {string} [cliDescription]
 *
 * @typedef {number | boolean | string} OptionValue
 * @typedef {OptionValue | [{ value: OptionValue[] }] | Array<{ since: string, value: OptionValue}>} OptionValueInfo
 *
 * @typedef {Object} OptionRedirectInfo
 * @property {string} option
 * @property {OptionValue} value
 *
 * @typedef {Object} OptionRangeInfo
 * @property {number} start - recommended range start
 * @property {number} end - recommended range end
 * @property {number} step - recommended range step
 *
 * @typedef {Object} OptionChoiceInfo
 * @property {boolean | string} value - boolean for the option that is originally boolean type
 * @property {string} description
 * @property {string} [since] - undefined if available since the first version of the option
 * @property {string} [deprecated] - deprecated since version
 * @property {OptionValueInfo} [redirect] - redirect deprecated value
 */

/** @type {{ [name: string]: OptionInfo }} */
const options = {
  cursorOffset: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: -1,
    range: { start: -1, end: Infinity, step: 1 },
    description: outdent`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end.
    `,
    cliCategory: CATEGORY_EDITOR,
  },
  endOfLine: {
    since: "1.15.0",
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: [
      { since: "1.15.0", value: "auto" },
      { since: "2.0.0", value: "lf" },
    ],
    description: "Which end of line characters to apply.",
    choices: [
      {
        value: "lf",
        description:
          "Line Feed only (\\n), common on Linux and macOS as well as inside git repos",
      },
      {
        value: "crlf",
        description:
          "Carriage Return + Line Feed characters (\\r\\n), common on Windows",
      },
      {
        value: "cr",
        description: "Carriage Return character only (\\r), used very rarely",
      },
      {
        value: "auto",
        description: outdent`
          Maintain existing
          (mixed values within one file are normalised by looking at what's used after the first line)
        `,
      },
    ],
  },
  filepath: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "path",
    description:
      "Specify the input filepath. This will be used to do parser inference.",
    cliName: "stdin-filepath",
    cliCategory: CATEGORY_OTHER,
    cliDescription: "Path to the file to pretend that stdin comes from.",
  },
  insertPragma: {
    since: "1.8.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: "Insert @format pragma into file's first docblock comment.",
    cliCategory: CATEGORY_OTHER,
  },
  parser: {
    since: "0.0.10",
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: [
      { since: "0.0.10", value: "babylon" },
      { since: "1.13.0", value: undefined },
    ],
    description: "Which parser to use.",
    exception: (value) =>
      typeof value === "string" || typeof value === "function",
    choices: [
      { value: "flow", description: "Flow" },
      { value: "babel", since: "1.16.0", description: "JavaScript" },
      { value: "babel-flow", since: "1.16.0", description: "Flow" },
      { value: "babel-ts", since: "2.0.0", description: "TypeScript" },
      { value: "typescript", since: "1.4.0", description: "TypeScript" },
      { value: "css", since: "1.7.1", description: "CSS" },
      { value: "less", since: "1.7.1", description: "Less" },
      { value: "scss", since: "1.7.1", description: "SCSS" },
      { value: "json", since: "1.5.0", description: "JSON" },
      { value: "json5", since: "1.13.0", description: "JSON5" },
      {
        value: "json-stringify",
        since: "1.13.0",
        description: "JSON.stringify",
      },
      { value: "graphql", since: "1.5.0", description: "GraphQL" },
      { value: "markdown", since: "1.8.0", description: "Markdown" },
      { value: "mdx", since: "1.15.0", description: "MDX" },
      { value: "vue", since: "1.10.0", description: "Vue" },
      { value: "yaml", since: "1.14.0", description: "YAML" },
      {
        value: "glimmer",
        since: null,
        description: "Handlebars",
      },
      { value: "html", since: "1.15.0", description: "HTML" },
      { value: "angular", since: "1.15.0", description: "Angular" },
      {
        value: "lwc",
        since: "1.17.0",
        description: "Lightning Web Components",
      },
    ],
  },
  plugins: {
    since: "1.10.0",
    type: "path",
    array: true,
    default: [{ value: [] }],
    category: CATEGORY_GLOBAL,
    description:
      "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.",
    exception: (value) =>
      typeof value === "string" || typeof value === "object",
    cliName: "plugin",
    cliCategory: CATEGORY_CONFIG,
  },
  pluginSearchDirs: {
    since: "1.13.0",
    type: "path",
    array: true,
    default: [{ value: [] }],
    category: CATEGORY_GLOBAL,
    description: outdent`
      Custom directory that contains prettier plugins in node_modules subdirectory.
      Overrides default behavior when plugins are searched relatively to the location of Prettier.
      Multiple values are accepted.
    `,
    exception: (value) =>
      typeof value === "string" || typeof value === "object",
    cliName: "plugin-search-dir",
    cliCategory: CATEGORY_CONFIG,
  },
  printWidth: {
    since: "0.0.0",
    category: CATEGORY_GLOBAL,
    type: "int",
    default: 80,
    description: "The line length where Prettier will try wrap.",
    range: { start: 0, end: Infinity, step: 1 },
  },
  rangeEnd: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: Infinity,
    range: { start: 0, end: Infinity, step: 1 },
    description: outdent`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
    `,
    cliCategory: CATEGORY_EDITOR,
  },
  rangeStart: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: 0,
    range: { start: 0, end: Infinity, step: 1 },
    description: outdent`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
    `,
    cliCategory: CATEGORY_EDITOR,
  },
  requirePragma: {
    since: "1.7.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: outdent`
      Require either '@prettier' or '@format' to be present in the file's first docblock comment
      in order for it to be formatted.
    `,
    cliCategory: CATEGORY_OTHER,
  },
  tabWidth: {
    type: "int",
    category: CATEGORY_GLOBAL,
    default: 2,
    description: "Number of spaces per indentation level.",
    range: { start: 0, end: Infinity, step: 1 },
  },
  useTabs: {
    since: "1.0.0",
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    description: "Indent with tabs instead of spaces.",
  },
  embeddedLanguageFormatting: {
    since: "2.1.0",
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: [{ since: "2.1.0", value: "auto" }],
    description:
      "Control how Prettier formats quoted code embedded in the file.",
    choices: [
      {
        value: "auto",
        description:
          "Format embedded code if Prettier can automatically identify it.",
      },
      {
        value: "off",
        description: "Never automatically format embedded code.",
      },
    ],
  },
};

module.exports = {
  CATEGORY_CONFIG,
  CATEGORY_EDITOR,
  CATEGORY_FORMAT,
  CATEGORY_OTHER,
  CATEGORY_OUTPUT,
  CATEGORY_GLOBAL,
  CATEGORY_SPECIAL,
  options,
};
