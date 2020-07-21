"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-markdown");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/Markdown"), (data) => ({
    since: "1.8.0",
    parsers: ["markdown"],
    vscodeLanguageIds: ["markdown"],
    filenames: data.filenames.concat(["README"]),
    extensions: data.extensions.filter((extension) => extension !== ".mdx"),
  })),
  createLanguage(require("linguist-languages/data/Markdown"), () => ({
    name: "MDX",
    since: "1.15.0",
    parsers: ["mdx"],
    vscodeLanguageIds: ["mdx"],
    filenames: [],
    extensions: [".mdx"],
  })),
];

const printers = {
  mdast: printer,
};

const parsers = {
  get remark() {
    return require("./parser-markdown").parsers.remark;
  },
  get markdown() {
    return require("./parser-markdown").parsers.remark;
  },
  get mdx() {
    return require("./parser-markdown").parsers.mdx;
  },
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
