"use strict";

const {
  builders: { hardline },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const {
  getLeftSidePathName,
  hasNakedLeftSide,
  isJsxNode,
  isTheOnlyJsxElementInMarkdown,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
} = require("../utils");
const { shouldPrintParamsWithoutParens } = require("./function");

/**
 * @typedef {import("../../document").Doc} Doc
 * @typedef {import("../../common/ast-path")} AstPath
 */

function printStatementSequence(path, options, print, property) {
  const node = path.getValue();
  const parts = [];
  const isClassBody = node.type === "ClassBody";
  const lastStatement = getLastStatement(node[property]);

  path.eachValue((node, index, statements) => {
    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (node.type === "EmptyStatement") {
      return;
    }

    const printed = print();

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon
    if (
      !options.semi &&
      !isClassBody &&
      !isTheOnlyJsxElementInMarkdown(options, path) &&
      statementNeedsASIProtection(path, options)
    ) {
      if (hasComment(node, CommentCheckFlags.Leading)) {
        parts.push(print([], { needsSemi: true }));
      } else {
        parts.push(";", printed);
      }
    } else {
      parts.push(printed);
    }

    if (
      !options.semi &&
      isClassBody &&
      isClassProperty(node) &&
      // `ClassBody` don't allow `EmptyStatement`,
      // so we can use `statements` to get next node
      shouldPrintSemicolonAfterClassProperty(node, statements[index + 1])
    ) {
      parts.push(";");
    }

    if (node !== lastStatement) {
      parts.push(hardline);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  }, property);

  return parts;
}

function getLastStatement(statements) {
  for (let i = statements.length - 1; i >= 0; i--) {
    const statement = statements[i];
    if (statement.type !== "EmptyStatement") {
      return statement;
    }
  }
}

function statementNeedsASIProtection(path, options) {
  const node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(
    (childPath) => expressionNeedsASIProtection(childPath, options),
    "expression"
  );
}

function expressionNeedsASIProtection(path, options) {
  const node = path.getValue();
  switch (node.type) {
    case "ParenthesizedExpression":
    case "TypeCastExpression":
    case "ArrayExpression":
    case "ArrayPattern":
    case "TemplateLiteral":
    case "TemplateElement":
    case "RegExpLiteral":
      return true;
    case "ArrowFunctionExpression": {
      if (!shouldPrintParamsWithoutParens(path, options)) {
        return true;
      }
      break;
    }
    case "UnaryExpression": {
      const { prefix, operator } = node;
      if (prefix && (operator === "+" || operator === "-")) {
        return true;
      }
      break;
    }
    case "BindExpression": {
      if (!node.object) {
        return true;
      }
      break;
    }
    case "Literal": {
      if (node.regex) {
        return true;
      }
      break;
    }
    default: {
      if (isJsxNode(node)) {
        return true;
      }
    }
  }

  if (pathNeedsParens(path, options)) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    (childPath) => expressionNeedsASIProtection(childPath, options),
    ...getLeftSidePathName(path, node)
  );
}

function printBody(path, options, print) {
  return printStatementSequence(path, options, print, "body");
}

function printSwitchCaseConsequent(path, options, print) {
  return printStatementSequence(path, options, print, "consequent");
}

const isClassProperty = ({ type }) =>
  type === "ClassProperty" ||
  type === "PropertyDefinition" ||
  type === "ClassPrivateProperty";
/**
 * @returns {boolean}
 */
function shouldPrintSemicolonAfterClassProperty(node, nextNode) {
  const name = node.key && node.key.name;
  // this isn't actually possible yet with most parsers available today
  // so isn't properly tested yet.
  if (
    (name === "static" || name === "get" || name === "set") &&
    !node.value &&
    !node.typeAnnotation
  ) {
    return true;
  }

  if (!nextNode) {
    return false;
  }

  if (
    nextNode.static ||
    nextNode.accessibility // TypeScript
  ) {
    return false;
  }

  if (!nextNode.computed) {
    const name = nextNode.key && nextNode.key.name;
    if (name === "in" || name === "instanceof") {
      return true;
    }
  }

  switch (nextNode.type) {
    case "ClassProperty":
    case "PropertyDefinition":
    case "TSAbstractClassProperty":
      return nextNode.computed;
    case "MethodDefinition": // Flow
    case "TSAbstractMethodDefinition": // TypeScript
    case "ClassMethod":
    case "ClassPrivateMethod": {
      // Babel
      const isAsync = nextNode.value ? nextNode.value.async : nextNode.async;
      if (isAsync || nextNode.kind === "get" || nextNode.kind === "set") {
        return false;
      }

      const isGenerator = nextNode.value
        ? nextNode.value.generator
        : nextNode.generator;
      if (nextNode.computed || isGenerator) {
        return true;
      }

      return false;
    }

    case "TSIndexSignature":
      return true;
  }

  /* istanbul ignore next */
  return false;
}

module.exports = {
  printBody,
  printSwitchCaseConsequent,
};
