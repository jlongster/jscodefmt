"use strict";

const { hasNewline } = require("../../common/util");
const {
  builders: { join, hardline },
} = require("../../document");

const { isLineComment, isBlockComment } = require("../utils");
const { locStart, locEnd } = require("../loc");

function printComment(commentPath, options) {
  const comment = commentPath.getValue();

  if (isLineComment(comment)) {
    // Supports `//`, `#!`, `<!--`, and `-->`
    return options.originalText
      .slice(locStart(comment), locEnd(comment))
      .trimEnd();
  }

  if (isBlockComment(comment)) {
    if (isIndentableBlockComment(comment)) {
      const printed = printIndentableBlockComment(comment);
      // We need to prevent an edge case of a previous trailing comment
      // printed as a `lineSuffix` which causes the comments to be
      // interleaved. See https://github.com/prettier/prettier/issues/4412
      if (
        comment.trailing &&
        !hasNewline(options.originalText, locStart(comment), {
          backwards: true,
        })
      ) {
        return [hardline, printed];
      }
      return printed;
    }

    const commentEnd = locEnd(comment);
    const isInsideFlowComment =
      options.originalText.slice(commentEnd - 3, commentEnd) === "*-/";
    return `/*${comment.value}${isInsideFlowComment ? "*-/" : "*/"}`;
  }

  /* istanbul ignore next */
  throw new Error(`Not a comment: ${JSON.stringify(comment)}`);
}

function isIndentableBlockComment(comment) {
  // If the comment has multiple lines and every line starts with a star
  // we can fix the indentation of each line. The stars in the `/*` and
  // `*/` delimiters are not included in the comment value, so add them
  // back first.
  const lines = `*${comment.value}*`.split("\n");
  return lines.length > 1 && lines.every((line) => line.trim()[0] === "*");
}

function printIndentableBlockComment(comment) {
  const lines = comment.value.split("\n");

  return [
    "/*",
    join(
      hardline,
      lines.map((line, index) =>
        index === 0
          ? line.trimEnd()
          : ` ${index < lines.length - 1 ? line.trim() : line.trimStart()}`
      )
    ),
    "*/",
  ];
}

module.exports = { printComment };
