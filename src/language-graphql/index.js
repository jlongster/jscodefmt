"use strict";

const printer = require("./printer-graphql");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/GraphQL"), () => ({
    since: "1.5.0",
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"],
  })),
];

const printers = {
  graphql: printer,
};

module.exports = {
  languages,
  options,
  printers,
};
