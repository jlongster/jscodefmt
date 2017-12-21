"use strict";

const parse = require("./parser-parse5");
const printer = require("./printer-htmlparser2");

const languages = [
  {
    name: "HTML",
    since: undefined, // unreleased
    parsers: ["parse5"],
    astFormat: "htmlparser2",
    group: "HTML",
    tmScope: "text.html.basic",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    aliases: ["xhtml"],
    extensions: [".html", ".htm", ".html.hl", ".inc", ".st", ".xht", ".xhtml"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["html"]
  }
];

const parsers = {
  parse5: parse
};

const printers = {
  htmlparser2: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
