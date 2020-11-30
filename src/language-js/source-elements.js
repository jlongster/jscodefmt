"use strict";

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
function isSourceElement(node) {
  const { type } = node;
  return (
    type === "Directive" ||
    type === "TypeAlias" ||
    type === "TSExportAssignment" ||
    type.startsWith("Declare") ||
    type.startsWith("TSDeclare") ||
    type.endsWith("Statement") ||
    type.endsWith("Declaration")
  );
}

const jsonSourceElements = new Set([
  "ObjectExpression",
  "ArrayExpression",
  "StringLiteral",
  "NumericLiteral",
  "BooleanLiteral",
  "NullLiteral",
]);
function isJsonSourceElement(node) {
  return jsonSourceElements.has(node.type);
}

module.exports = { isSourceElement, isJsonSourceElement };
