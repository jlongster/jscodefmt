/* eslint-disable prettier-internal-rules/no-doc-builder-concat */
"use strict";

const {
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  conditionalGroup,
  fill,
  lineSuffix,
  lineSuffixBoundary,
  cursor,
  breakParent,
  ifBreak,
  trim,
  indent,
  indentIfBreak,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent,
  hardlineWithoutBreakParent,
  literallineWithoutBreakParent,
  label,
} = require("./doc-builders");
const { printDocToString } = require("./doc-printer");
const {
  willBreak,
  traverseDoc,
  findInDoc,
  mapDoc,
  propagateBreaks,
  removeLines,
  stripTrailingHardline,
  replaceNewlinesWithLiterallines,
} = require("./doc-utils");
const { printDocToDebug } = require("./doc-debug");

/**
 * @typedef {import("./doc-builders").Doc} Doc
 */

function concat(parts) {
  return { type: "concat", parts };
}

module.exports = {
  builders: {
    line,
    softline,
    group,
    conditionalGroup,
    fill,
    lineSuffix,
    lineSuffixBoundary,
    cursor,
    breakParent,
    ifBreak,
    trim,
    indent,
    indentIfBreak,
    align,
    addAlignmentToDoc,
    markAsRoot,
    dedentToRoot,
    dedent,
    hardlineWithoutBreakParent,
    literallineWithoutBreakParent,
    label,

    // TODO: Remove `concat` in `v3.0.0`
    concat,
    hardline: concat(hardline),
    literalline: concat(literalline),
    join: (sep, arr) => concat(join(sep, arr)),
  },
  printer: { printDocToString },
  utils: {
    willBreak,
    traverseDoc,
    findInDoc,
    mapDoc,
    propagateBreaks,
    removeLines,
    stripTrailingHardline,
    replaceNewlinesWithLiterallines,
  },
  debug: { printDocToDebug },
};
