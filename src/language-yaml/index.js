"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-yaml");
const options = require("./options");
const parsers = require("./parsers");

const languages = [
  createLanguage(require("linguist-languages/data/YAML.json"), (data) => ({
    since: "1.14.0",
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    // yarn.lock is not YAML: https://github.com/yarnpkg/yarn/issues/5629
    filenames: [
      ...data.filenames.filter((filename) => filename !== "yarn.lock"),
      ".prettierrc",
      ".stylelintrc",
    ],
  })),
];

module.exports = {
  languages,
  printers: { yaml: printer },
  options,
  parsers,
};
