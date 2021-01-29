"use strict";

const {
  builders: { hardline, indent, join },
} = require("../document");
const preprocess = require("./print-preprocess");

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "JsonRoot":
      return [path.call(print, "node"), hardline];
    case "ArrayExpression":
      return node.elements.length === 0
        ? "[]"
        : [
            "[",
            indent([
              hardline,
              join([",", hardline], path.map(print, "elements")),
            ]),
            hardline,
            "]",
          ];
    case "ObjectExpression":
      return node.properties.length === 0
        ? "{}"
        : [
            "{",
            indent([
              hardline,
              join([",", hardline], path.map(print, "properties")),
            ]),
            hardline,
            "}",
          ];
    case "ObjectProperty":
      return [path.call(print, "key"), ": ", path.call(print, "value")];
    case "UnaryExpression":
      return [
        node.operator === "+" ? "" : node.operator,
        path.call(print, "argument"),
      ];
    case "NullLiteral":
      return "null";
    case "BooleanLiteral":
      return node.value ? "true" : "false";
    case "StringLiteral":
    case "NumericLiteral":
      return JSON.stringify(node.value);
    case "Identifier":
      return JSON.stringify(node.name);
    default:
      /* istanbul ignore next */
      throw new Error(`unknown type: ${JSON.stringify(node.type)}`);
  }
}

const ignoredProperties = new Set([
  "start",
  "end",
  "extra",
  "loc",
  "comments",
  "errors",
  "range",
]);

function clean(node, newNode /*, parent*/) {
  const { type } = node;
  if (type === "Identifier") {
    return { type: "StringLiteral", value: node.name };
  }
  if (type === "UnaryExpression" && node.operator === "+") {
    return newNode.argument;
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = {
  preprocess,
  print: genericPrint,
  massageAstNode: clean,
};
