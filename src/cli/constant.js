"use strict";

const { outdent } = require("outdent");
const { coreOptions } = require("./prettier-internal");

const categoryOrder = [
  coreOptions.CATEGORY_OUTPUT,
  coreOptions.CATEGORY_FORMAT,
  coreOptions.CATEGORY_CONFIG,
  coreOptions.CATEGORY_EDITOR,
  coreOptions.CATEGORY_OTHER,
];

/**
 * {
 *   [optionName]: {
 *     // The type of the option. For 'choice', see also `choices` below.
 *     // When passing a type other than the ones listed below, the option is
 *     // treated as taking any string as argument, and `--option <${type}>` will
 *     // be displayed in --help.
 *     type: "boolean" | "choice" | "int" | string;
 *
 *     // Default value to be passed to the minimist option `default`.
 *     default?: any;
 *
 *     // Alias name to be passed to the minimist option `alias`.
 *     alias?: string;
 *
 *     // For grouping options by category in --help.
 *     category?: string;
 *
 *     // Description to be displayed in --help. If omitted, the option won't be
 *     // shown at all in --help (but see also `oppositeDescription` below).
 *     description?: string;
 *
 *     // Description for `--no-${name}` to be displayed in --help. If omitted,
 *     // `--no-${name}` won't be shown.
 *     oppositeDescription?: string;
 *
 *     // Indicate if this option is simply passed to the API.
 *     // true: use camelified name as the API option name.
 *     // string: use this value as the API option name.
 *     forwardToApi?: boolean | string;
 *
 *     // Indicate that a CLI flag should be an array when forwarded to the API.
 *     array?: boolean;
 *
 *     // Specify available choices for validation. They will also be displayed
 *     // in --help as <a|b|c>.
 *     // Use an object instead of a string if a choice is deprecated and should
 *     // be treated as `redirect` instead, or if you'd like to add description for
 *     // the choice.
 *     choices?: Array<
 *       | string
 *       | { value: string, description?: string, deprecated?: boolean, redirect?: string }
 *     >;
 *
 *     // If the option has a value that is an exception to the regular value
 *     // constraints, indicate that value here (or use a function for more
 *     // flexibility).
 *     exception?: ((value: any) => boolean);
 *
 *     // Indicate that the option is deprecated. Use a string to add an extra
 *     // message to --help for the option, for example to suggest a replacement
 *     // option.
 *     deprecated?: true | string;
 *   }
 * }
 *
 * Note: The options below are sorted alphabetically.
 */
const options = {
  check: {
    type: "boolean",
    category: coreOptions.CATEGORY_OUTPUT,
    alias: "c",
    description: outdent`
      Check if the given files are formatted, print a human-friendly summary
      message and paths to unformatted files (see also --list-different).
    `,
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    type: "boolean",
    default: true,
    description: "Colorize error messages.",
    oppositeDescription: "Do not colorize error messages.",
  },
  config: {
    type: "path",
    category: coreOptions.CATEGORY_CONFIG,
    description:
      "Path to a Prettier configuration file (.prettierrc, package.json, prettier.config.js).",
    oppositeDescription: "Do not look for a configuration file.",
    exception: (value) => value === false,
  },
  "config-precedence": {
    type: "choice",
    category: coreOptions.CATEGORY_CONFIG,
    default: "cli-override",
    choices: [
      {
        value: "cli-override",
        description: "CLI options take precedence over config file",
      },
      {
        value: "file-override",
        description: "Config file take precedence over CLI options",
      },
      {
        value: "prefer-file",
        description: outdent`
          If a config file is found will evaluate it and ignore other CLI options.
          If no config file is found CLI options will evaluate as normal.
        `,
      },
    ],
    description:
      "Define in which order config files and CLI options should be evaluated.",
  },
  "debug-benchmark": {
    // Run the formatting benchmarks. Requires 'benchmark' module to be installed.
    type: "boolean",
  },
  "debug-check": {
    // Run the formatting once again on the formatted output, throw if different.
    type: "boolean",
  },
  "debug-print-doc": {
    type: "boolean",
  },
  "debug-repeat": {
    // Repeat the formatting a few times and measure the average duration.
    type: "int",
    default: 0,
  },
  editorconfig: {
    type: "boolean",
    category: coreOptions.CATEGORY_CONFIG,
    description: "Take .editorconfig into account when parsing configuration.",
    oppositeDescription:
      "Don't take .editorconfig into account when parsing configuration.",
    default: true,
  },
  "find-config-path": {
    type: "path",
    category: coreOptions.CATEGORY_CONFIG,
    description:
      "Find and print the path to a configuration file for the given input file.",
  },
  "file-info": {
    type: "path",
    description: outdent`
      Extract the following info (as JSON) for a given file path. Reported fields:
      * ignored (boolean) - true if file path is filtered by --ignore-path
      * inferredParser (string | null) - name of parser inferred from file path
    `,
  },
  help: {
    type: "flag",
    alias: "h",
    description: outdent`
      Show CLI usage, or details about the given flag.
      Example: --help write
    `,
    exception: (value) => value === "",
  },
  "ignore-path": {
    type: "path",
    category: coreOptions.CATEGORY_CONFIG,
    default: ".prettierignore",
    description: "Path to a file with patterns describing files to ignore.",
  },
  "list-different": {
    type: "boolean",
    category: coreOptions.CATEGORY_OUTPUT,
    alias: "l",
    description:
      "Print the names of files that are different from Prettier's formatting (see also --check).",
  },
  loglevel: {
    type: "choice",
    description: "What level of logs to report.",
    default: "log",
    choices: ["silent", "error", "warn", "log", "debug"],
  },
  "support-info": {
    type: "boolean",
    description: "Print support information as JSON.",
  },
  version: {
    type: "boolean",
    alias: "v",
    description: "Print Prettier version.",
  },
  "with-node-modules": {
    type: "boolean",
    category: coreOptions.CATEGORY_CONFIG,
    description: "Process files inside 'node_modules' directory.",
  },
  write: {
    type: "boolean",
    category: coreOptions.CATEGORY_OUTPUT,
    description: "Edit files in-place. (Beware!)",
  },
};

const usageSummary = outdent`
  Usage: prettier [options] [file/dir/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

module.exports = {
  categoryOrder,
  options,
  usageSummary,
};
