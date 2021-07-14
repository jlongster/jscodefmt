"use strict";

const {
  inferParserByLanguage,
  getMaxContinuousCount,
} = require("../common/util");
const {
  builders: { hardline, markAsRoot },
  utils: { replaceEndOfLine },
} = require("../document");
const printFrontMatter = require("../utils/front-matter/print");
const { getFencedCodeBlockValue } = require("./utils");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  if (node.type === "code" && node.lang !== null) {
    const parser = inferParserByLanguage(node.lang, options);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = textToDoc(
        getFencedCodeBlockValue(node, options.originalText),
        { parser },
        { stripTrailingHardline: true }
      );
      return markAsRoot([
        style,
        node.lang,
        node.meta ? " " + node.meta : "",
        hardline,
        replaceEndOfLine(doc),
        hardline,
        style,
      ]);
    }
  }

  switch (node.type) {
    case "front-matter":
      return printFrontMatter(node, textToDoc);

    // MDX
    case "importExport":
      return [
        textToDoc(
          node.value,
          { parser: "babel" },
          { stripTrailingHardline: true }
        ),
        hardline,
      ];
    case "jsx":
      return textToDoc(
        `<$>${node.value}</$>`,
        {
          parser: "__js_expression",
          rootMarker: "mdx",
        },
        { stripTrailingHardline: true }
      );
  }

  return null;
}

module.exports = embed;
