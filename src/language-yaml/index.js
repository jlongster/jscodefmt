"use strict";

const printer = require("./printer-yaml");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/YAML"), (data) => ({
    since: "1.14.0",
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml", "ansible"],
    // yarn.lock is not YAML: https://github.com/yarnpkg/yarn/issues/5629
    filenames: data.filenames.filter((filename) => filename !== "yarn.lock"),
  })),
];

module.exports = {
  languages,
  printers: { yaml: printer },
  options,
};
