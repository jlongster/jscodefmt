"use strict";

const {
  builders: { concat, join, line },
} = require("../document");

function printHtmlBinding(path, options, print) {
  const node = path.getValue();

  if (options.__onHtmlBindingRoot && path.getName() === null) {
    options.__onHtmlBindingRoot(node, options);
  }

  if (node.type !== "File") {
    return;
  }

  if (options.__isVueForBindingLeft) {
    return path.call(
      (functionDeclarationPath) => {
        const { params } = functionDeclarationPath.getValue();
        return concat([
          params.length > 1 ? "(" : "",
          join(
            concat([",", line]),
            functionDeclarationPath.map(print, "params")
          ),
          params.length > 1 ? ")" : "",
        ]);
      },
      "program",
      "body",
      0
    );
  }

  if (options.__isVueSlotScope) {
    return path.call(
      (functionDeclarationPath) =>
        join(concat([",", line]), functionDeclarationPath.map(print, "params")),
      "program",
      "body",
      0
    );
  }
}

// based on https://github.com/prettier/prettier/blob/master/src/language-html/syntax-vue.js isVueEventBindingExpression()
function isVueEventBindingExpression(node) {
  switch (node.type) {
    case "MemberExpression":
      switch (node.property.type) {
        case "Identifier":
        case "NumericLiteral":
        case "StringLiteral":
          return isVueEventBindingExpression(node.object);
      }
      return false;
    case "Identifier":
      return true;
    default:
      return false;
  }
}

module.exports = {
  isVueEventBindingExpression,
  printHtmlBinding,
};
