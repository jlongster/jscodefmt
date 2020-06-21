"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/JavaScript"), (data) => ({
    since: "0.0.0",
    parsers: ["babel", "flow"],
    vscodeLanguageIds: ["javascript", "mongo"],
    interpreters: data.interpreters.concat(["nodejs"]),
  })),
  createLanguage(require("linguist-languages/data/JavaScript"), () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["babel", "flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(require("linguist-languages/data/JSX"), () => ({
    since: "0.0.0",
    parsers: ["babel", "flow"],
    vscodeLanguageIds: ["javascriptreact"],
  })),
  createLanguage(require("linguist-languages/data/TypeScript"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(require("linguist-languages/data/TSX"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(require("linguist-languages/data/JSON"), () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(require("linguist-languages/data/JSON"), (data) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    filenames: data.filenames.concat([".prettierrc"]),
  })),
  createLanguage(
    require("linguist-languages/data/JSON with Comments"),
    (data) => ({
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"],
      filenames: data.filenames.concat([".eslintrc"]),
    })
  ),
  createLanguage(require("linguist-languages/data/JSON5"), () => ({
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter,
};

module.exports = {
  languages,
  options,
  printers,
};
