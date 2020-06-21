"use strict";

const jsPragma = require("../language-js/pragma");
const parseFrontMatter = require("../utils/front-matter");

function hasPragma(text) {
  return jsPragma.hasPragma(parseFrontMatter(text).content);
}

function insertPragma(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") +
    jsPragma.insertPragma(content)
  );
}

module.exports = {
  hasPragma,
  insertPragma,
};
