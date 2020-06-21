"use strict";

const docblock = require("jest-docblock");
const { getShebang } = require("../common/util");

function hasPragma(text) {
  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length + 1);
  }
  const pragmas = Object.keys(docblock.parse(docblock.extract(text)));
  return pragmas.includes("prettier") || pragmas.includes("format");
}

function insertPragma(text) {
  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length + 1);
  }
  const parsedDocblock = docblock.parseWithComments(docblock.extract(text));
  const pragmas = { format: "", ...parsedDocblock.pragmas };
  const newDocblock = docblock
    .print({
      pragmas,
      comments: parsedDocblock.comments.replace(/^(\s+?\r?\n)+/, ""), // remove leading newlines
    })
    .replace(/(\r\n|\r)/g, "\n"); // normalise newlines (mitigate use of os.EOL by jest-docblock)
  const strippedText = docblock.strip(text);
  const separatingNewlines = strippedText.startsWith("\n") ? "\n" : "\n\n";
  return (
    (shebang ? `${shebang}\n` : "") +
    newDocblock +
    separatingNewlines +
    strippedText
  );
}

module.exports = {
  hasPragma,
  insertPragma,
};
