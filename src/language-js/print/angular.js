"use strict";

const {
  builders: { join, line, group },
} = require("../../document");
const { hasNode, hasComment, getComments } = require("../utils");
const { printBinaryishExpression } = require("./binaryish");

/** @typedef {import("../types/estree").Node} Node */

function printAngular(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "NGRoot":
      return [
        print("node"),
        !hasComment(node.node)
          ? ""
          : " //" + getComments(node.node)[0].value.trimEnd(),
      ];
    case "NGPipeExpression":
      return printBinaryishExpression(path, options, print);
    case "NGChainedExpression":
      return group(
        join(
          [";", line],
          path.mapValue(
            (node) => (hasNgSideEffect(node) ? print() : ["(", print(), ")"]),
            "expressions"
          )
        )
      );
    case "NGEmptyExpression":
      return "";
    case "NGQuotedExpression":
      return [node.prefix, ": ", node.value.trim()];
    case "NGMicrosyntax":
      return path.mapValue(
        (child, index) => [
          index === 0 ? "" : isNgForOf(child, index, node) ? " " : [";", line],
          print(),
        ],
        "body"
      );
    case "NGMicrosyntaxKey":
      return /^[$_a-z][\w$]*(-[$_a-z][\w$])*$/i.test(node.name)
        ? node.name
        : JSON.stringify(node.name);
    case "NGMicrosyntaxExpression":
      return [
        print("expression"),
        node.alias === null ? "" : [" as ", print("alias")],
      ];
    case "NGMicrosyntaxKeyedExpression": {
      const index = path.getName();
      const parentNode = path.getParentNode();
      const shouldNotPrintColon =
        isNgForOf(node, index, parentNode) ||
        (((index === 1 &&
          (node.key.name === "then" || node.key.name === "else")) ||
          (index === 2 &&
            node.key.name === "else" &&
            parentNode.body[index - 1].type ===
              "NGMicrosyntaxKeyedExpression" &&
            parentNode.body[index - 1].key.name === "then")) &&
          parentNode.body[0].type === "NGMicrosyntaxExpression");
      return [
        print("key"),
        shouldNotPrintColon ? " " : ": ",
        print("expression"),
      ];
    }
    case "NGMicrosyntaxLet":
      return [
        "let ",
        print("key"),
        node.value === null ? "" : [" = ", print("value")],
      ];
    case "NGMicrosyntaxAs":
      return [print("key"), " as ", print("alias")];
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
 * @param {Node} node
 * @returns {boolean}
 */
function hasNgSideEffect(node) {
  return hasNode(node, (node) => {
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
