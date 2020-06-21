"use strict";

const printer = require("./printer-html");
const createLanguage = require("../utils/create-language");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/HTML"), () => ({
    name: "Angular",
    since: "1.15.0",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/HTML"), (data) => ({
    since: "1.15.0",
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
    extensions: data.extensions.concat([
      ".mjml", // MJML is considered XML in Linguist but it should be formatted as HTML
    ]),
  })),
  createLanguage(require("linguist-languages/data/HTML"), () => ({
    name: "Lightning Web Components",
    since: "1.17.0",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/Vue"), () => ({
    since: "1.10.0",
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

const printers = {
  html: printer,
};

module.exports = {
  languages,
  printers,
  options,
};
