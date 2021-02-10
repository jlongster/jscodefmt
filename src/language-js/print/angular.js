"use strict";

const {
  builders: { join, line, group },
} = require("../../document");
const { hasNode, hasComment, getComments } = require("../utils");
const { printBinaryishExpression } = require("./binaryish");

/** @typedef {import("../../common/ast-path")} AstPath */

function printAngular(path, options, print) {
  const n = path.getValue();
  switch (n.type) {
    case "NGRoot":
      return [
        path.call(print, "node"),
        !hasComment(n.node)
          ? ""
          : " //" + getComments(n.node)[0].value.trimEnd(),
      ];
    case "NGPipeExpression":
      return printBinaryishExpression(path, options, print);
    case "NGChainedExpression":
      return group(
        join(
          [";", line],
          path.map(
            (childPath) =>
              hasNgSideEffect(childPath)
                ? print(childPath)
                : ["(", print(childPath), ")"],
            "expressions"
          )
        )
      );
    case "NGEmptyExpression":
      return "";
    case "NGQuotedExpression":
      return [n.prefix, ": ", n.value.trim()];
    case "NGMicrosyntax":
      return path.map(
        (childPath, index) => [
          index === 0
            ? ""
            : isNgForOf(childPath.getValue(), index, n)
            ? " "
            : [";", line],
          print(childPath),
        ],
        "body"
      );
    case "NGMicrosyntaxKey":
      return /^[$_a-z][\w$]*(-[$_a-z][\w$])*$/i.test(n.name)
        ? n.name
        : JSON.stringify(n.name);
    case "NGMicrosyntaxExpression":
      return [
        path.call(print, "expression"),
        n.alias === null ? "" : [" as ", path.call(print, "alias")],
      ];
    case "NGMicrosyntaxKeyedExpression": {
      const index = path.getName();
      const parentNode = path.getParentNode();
      const shouldNotPrintColon =
        isNgForOf(n, index, parentNode) ||
        (((index === 1 && (n.key.name === "then" || n.key.name === "else")) ||
          (index === 2 &&
            n.key.name === "else" &&
            parentNode.body[index - 1].type ===
              "NGMicrosyntaxKeyedExpression" &&
            parentNode.body[index - 1].key.name === "then")) &&
          parentNode.body[0].type === "NGMicrosyntaxExpression");
      return [
        path.call(print, "key"),
        shouldNotPrintColon ? " " : ": ",
        path.call(print, "expression"),
      ];
    }
    case "NGMicrosyntaxLet":
      return [
        "let ",
        path.call(print, "key"),
        n.value === null ? "" : [" = ", path.call(print, "value")],
      ];
    case "NGMicrosyntaxAs":
      return [path.call(print, "key"), " as ", path.call(print, "alias")];
  }
}

function isNgForOf(node, index, parentNode) {
  return (
    node.type === "NGMicrosyntaxKeyedExpression" &&
    node.key.name === "of" &&
    index === 1 &&
    parentNode.body[0].type === "NGMicrosyntaxLet" &&
    parentNode.body[0].value === null
  );
}

/** identify if an angular expression seems to have side effects */
/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function hasNgSideEffect(path) {
  return hasNode(path.getValue(), (node) => {
    switch (node.type) {
      case undefined:
        return false;
      case "CallExpression":
      case "OptionalCallExpression":
      case "AssignmentExpression":
        return true;
    }
  });
}

module.exports = { printAngular };
