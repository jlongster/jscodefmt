"use strict";

const getLast = require("../../utils/get-last");
const { getStringWidth, getIndentSize } = require("../../common/util");
const {
  builders: {
    join,
    hardline,
    softline,
    group,
    indent,
    align,
    lineSuffixBoundary,
    addAlignmentToDoc,
  },
  printer: { printDocToString },
  utils: { mapDoc },
} = require("../../document");
const {
  isBinaryish,
  isJestEachTemplateLiteral,
  isSimpleTemplateLiteral,
  hasComment,
  isMemberExpression,
} = require("../utils");

function printTemplateLiteral(path, print, options) {
  const node = path.getValue();
  const isTemplateLiteral = node.type === "TemplateLiteral";

  if (
    isTemplateLiteral &&
    isJestEachTemplateLiteral(node, path.getParentNode())
  ) {
    const printed = printJestEachTemplateLiteral(path, options, print);
    if (printed) {
      return printed;
    }
  }
  let expressionsKey = "expressions";
  if (node.type === "TSTemplateLiteralType") {
    expressionsKey = "types";
  }
  const parts = [];

  let expressions = path.map(print, expressionsKey);
  const isSimple = isSimpleTemplateLiteral(node);

  if (isSimple) {
    expressions = expressions.map(
      (doc) =>
        printDocToString(doc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
        }).formatted
    );
  }

  parts.push(lineSuffixBoundary, "`");

  path.eachValue((quasi, i) => {
    parts.push(print());

    if (i < expressions.length) {
      // For a template literal of the following form:
      //   `someQuery {
      //     ${call({
      //       a,
      //       b,
      //     })}
      //   }`
      // the expression is on its own line (there is a \n in the previous
      // quasi literal), therefore we want to indent the JavaScript
      // expression inside at the beginning of ${ instead of the beginning
      // of the `.
      const { tabWidth } = options;

      const indentSize = getIndentSize(quasi.value.raw, tabWidth);

      let printed = expressions[i];

      if (!isSimple) {
        const expression = node[expressionsKey][i];
        // Breaks at the template element boundaries (${ and }) are preferred to breaking
        // in the middle of a MemberExpression
        if (
          hasComment(expression) ||
          isMemberExpression(expression) ||
          expression.type === "ConditionalExpression" ||
          expression.type === "SequenceExpression" ||
          expression.type === "TSAsExpression" ||
          isBinaryish(expression)
        ) {
          printed = [indent([softline, printed]), softline];
        }
      }

      const aligned =
        indentSize === 0 && quasi.value.raw.endsWith("\n")
          ? align(Number.NEGATIVE_INFINITY, printed)
          : addAlignmentToDoc(printed, indentSize, tabWidth);

      parts.push(group(["${", aligned, lineSuffixBoundary, "}"]));
    }
  }, "quasis");

  parts.push("`");

  return parts;
}

function printJestEachTemplateLiteral(path, options, print) {
  /**
   * a    | b    | expected
   * ${1} | ${1} | ${2}
   * ${1} | ${2} | ${3}
   * ${2} | ${1} | ${3}
   */
  const node = path.getNode();
  const headerNames = node.quasis[0].value.raw.trim().split(/\s*\|\s*/);
  if (
    headerNames.length > 1 ||
    headerNames.some((headerName) => headerName.length > 0)
  ) {
    options.__inJestEach = true;
    const expressions = path.map(print, "expressions");
    options.__inJestEach = false;
    const parts = [];
    const stringifiedExpressions = expressions.map(
      (doc) =>
        "${" +
        printDocToString(doc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
          endOfLine: "lf",
        }).formatted +
        "}"
    );

    const tableBody = [{ hasLineBreak: false, cells: [] }];
    for (let i = 1; i < node.quasis.length; i++) {
      const row = getLast(tableBody);
      const correspondingExpression = stringifiedExpressions[i - 1];

      row.cells.push(correspondingExpression);
      if (correspondingExpression.includes("\n")) {
        row.hasLineBreak = true;
      }

      if (node.quasis[i].value.raw.includes("\n")) {
        tableBody.push({ hasLineBreak: false, cells: [] });
      }
    }

    const maxColumnCount = Math.max(
      headerNames.length,
      ...tableBody.map((row) => row.cells.length)
    );

    const maxColumnWidths = Array.from({ length: maxColumnCount }).fill(0);
    const table = [
      { cells: headerNames },
      ...tableBody.filter((row) => row.cells.length > 0),
    ];
    for (const { cells } of table.filter((row) => !row.hasLineBreak)) {
      for (const [index, cell] of cells.entries()) {
        maxColumnWidths[index] = Math.max(
          maxColumnWidths[index],
          getStringWidth(cell)
        );
      }
    }

    parts.push(
      lineSuffixBoundary,
      "`",
      indent([
        hardline,
        join(
          hardline,
          table.map((row) =>
            join(
              " | ",
              row.cells.map((cell, index) =>
                row.hasLineBreak
                  ? cell
                  : cell +
                    " ".repeat(maxColumnWidths[index] - getStringWidth(cell))
              )
            )
          )
        ),
      ]),
      hardline,
      "`"
    );
    return parts;
  }
}

function printTemplateExpression(path, print) {
  const node = path.getValue();
  let printed = print();
  if (hasComment(node)) {
    printed = group([indent([softline, printed]), softline]);
  }
  return ["${", printed, lineSuffixBoundary, "}"];
}

function printTemplateExpressions(path, print) {
  return path.mapValue(
    () => printTemplateExpression(path, print),
    "expressions"
  );
}

function escapeTemplateCharacters(doc, raw) {
  return mapDoc(doc, (currentDoc) => {
    if (typeof currentDoc === "string") {
      return raw
        ? currentDoc.replace(/(\\*)`/g, "$1$1\\`")
        : uncookTemplateElementValue(currentDoc);
    }

    return currentDoc;
  });
}

function uncookTemplateElementValue(cookedValue) {
  return cookedValue.replace(/([\\`]|\${)/g, "\\$1");
}

module.exports = {
  printTemplateLiteral,
  printTemplateExpressions,
  escapeTemplateCharacters,
  uncookTemplateElementValue,
};
