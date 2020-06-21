"use strict";

const {
  builders: { hardline, literalline, concat, markAsRoot },
  utils: { mapDoc },
} = require("../document");
const { isFrontMatterNode } = require("../common/util");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (isFrontMatterNode(node) && node.lang === "yaml") {
    return markAsRoot(
      concat([
        "---",
        hardline,
        node.value.trim()
          ? replaceNewlinesWithLiterallines(
              textToDoc(node.value, { parser: "yaml" })
            )
          : "",
        "---",
        hardline,
      ])
    );
  }

  return null;

  function replaceNewlinesWithLiterallines(doc) {
    return mapDoc(doc, (currentDoc) =>
      typeof currentDoc === "string" && currentDoc.includes("\n")
        ? concat(
            currentDoc
              .split(/(\n)/g)
              .map((v, i) => (i % 2 === 0 ? v : literalline))
          )
        : currentDoc
    );
  }
}

module.exports = embed;
