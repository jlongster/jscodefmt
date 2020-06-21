"use strict";

const path = require("path");
const { outdent } = require("outdent");

const TESTS_ROOT = path.join(__dirname, "../../tests");

const getCategory = (dirname) =>
  path.relative(TESTS_ROOT, dirname).split(path.sep).shift();

const categoryParsers = new Map([
  [
    "angular",
    {
      parsers: ["angular", "__ng_interpolation", "__ng_action"],
      verifyParsers: [],
      extensions: [".html", ".ng"],
    },
  ],
  [
    "css",
    { parsers: ["css"], verifyParsers: ["less", "scss"], extensions: [".css"] },
  ],
  [
    "flow",
    {
      parsers: ["flow", "babel-flow"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js"],
    },
  ],
  [
    "flow-repo",
    {
      parsers: ["flow", "babel-flow"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js"],
    },
  ],
  [
    "graphql",
    { parsers: ["graphql"], verifyParsers: [], extensions: [".graphql"] },
  ],
  [
    "handlebars",
    { parsers: ["glimmer"], verifyParsers: [], extensions: [".hbs"] },
  ],
  ["html", { parsers: ["html"], verifyParsers: [], extensions: [".html"] }],
  ["mjml", { parsers: ["html"], verifyParsers: [], extensions: [".mjml"] }],
  [
    "js",
    {
      parsers: ["babel"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js"],
    },
  ],
  [
    "json",
    {
      parsers: ["json", "json5", "json-stringify"],
      verifyParsers: [],
      extensions: [".json"],
    },
  ],
  [
    "jsx",
    {
      parsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js"],
    },
  ],
  [
    "less",
    {
      parsers: ["less"],
      verifyParsers: ["css", "scss"],
      extensions: [".less"],
    },
  ],
  ["lwc", { parsers: ["lwc"], verifyParsers: [], extensions: [".html"] }],
  [
    "markdown",
    { parsers: ["markdown"], verifyParsers: [], extensions: [".md"] },
  ],
  ["mdx", { parsers: ["mdx"], verifyParsers: [], extensions: [".mdx"] }],
  [
    "scss",
    {
      parsers: ["scss"],
      verifyParsers: ["css", "less"],
      extensions: [".scss"],
    },
  ],
  [
    "stylefmt-repo",
    { parsers: ["css", "scss"], verifyParsers: [], extensions: [".css"] },
  ],
  [
    "typescript",
    {
      parsers: ["typescript", "babel-ts"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".ts", ".tsx"],
    },
  ],
  [
    "vue",
    { parsers: ["vue"], verifyParsers: [], extensions: [".vue", ".html"] },
  ],
  ["yaml", { parsers: ["yaml"], verifyParsers: [], extensions: [".yml"] }],
]);

const getParserCategories = (parser) => {
  const categories = [];
  for (const [category, { parsers }] of categoryParsers) {
    if (parsers.includes(parser)) {
      categories.push(category);
    }
  }

  return categories;
};

const checkParser = ({ dirname, files }, parsers = []) => {
  const category = getCategory(dirname);
  const categoryAllowedParsers = categoryParsers.get(category);

  if (!categoryAllowedParsers) {
    return;
  }

  const {
    parsers: allowedParsers = [],
    verifyParsers: allowedVerifyParsers = [],
    extensions = [],
  } = categoryAllowedParsers;

  const [parser, ...verifyParsers] = parsers;

  if (verifyParsers.includes(parser)) {
    throw new Error(
      `verifyParsers ${JSON.stringify(
        verifyParsers
      )} should not include parser "${parser}".`
    );
  }

  if (allowedParsers && !allowedParsers.includes(parser)) {
    const suggestCategories = getParserCategories(parser);

    const suggestion =
      suggestCategories.length === 0
        ? ""
        : outdent`
            Suggest move your tests to:
            ${suggestCategories
              .map((category) => `- ${path.join(TESTS_ROOT, category)}`)
              .join("\n")}

            Or config to allow use this parser in "${__filename}".
          `;

    throw new Error(
      `Parser "${parser}" should not used in "${dirname}".${
        suggestion ? `\n\n${suggestion}` : ""
      }`
    );
  }

  if (allowedVerifyParsers) {
    for (const verifyParser of verifyParsers) {
      if (!allowedVerifyParsers.includes(verifyParser)) {
        throw new Error(
          outdent`
            Parser "${verifyParser}" should not used to verify in "${dirname}".
            Please remove it or config to allow use this parser in "${__filename}".
          `
        );
      }
    }
  }

  for (const { name, filename } of files) {
    const ext = path.extname(filename);
    if (!extensions.includes(ext)) {
      throw new Error(
        outdent`
          File "${name}" should not tested in "${dirname}".
          Allowed extensions: ${extensions.join(",")}.
          Please rename it or config to allow test "${ext}" file in "${__filename}".
        `
      );
    }
  }
};

module.exports = checkParser;
