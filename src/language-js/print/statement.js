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
 * @typedef {import("../../common/fast-path")} FastPath
 */

function printStatementSequence(path, options, print, property) {
  const node = path.getValue();
  const parts = [];
  const isClassBody = node.type === "ClassBody";
  const lastStatement = getLastStatement(node[property]);

  path.each((path, index, statements) => {
    const node = path.getValue();

    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (node.type === "EmptyStatement") {
      return;
    }

    const printed = print(path);

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon
    if (
      !options.semi &&
      !isClassBody &&
      !isTheOnlyJsxElementInMarkdown(options, path) &&
      statementNeedsASIProtection(path, options)
    ) {
      if (hasComment(node, CommentCheckFlags.Leading)) {
        parts.push(print(path, { needsSemi: true }));
      } else {
        parts.push(";", printed);
      }
    } else {
      parts.push(printed);
    }

    if (!options.semi && isClassBody) {
      if (classPropMayCauseASIProblems(node)) {
        parts.push(";");
      } else if (
        (node.type === "ClassProperty" || node.type === "PropertyDefinition") &&
        classChildNeedsASIProtection(statements[index + 1])
      ) {
        parts.push(";");
      }
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

  const maybeASIProblem =
    pathNeedsParens(path, options) ||
    node.type === "ParenthesizedExpression" ||
    node.type === "TypeCastExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      !shouldPrintParamsWithoutParens(path, options)) ||
    node.type === "ArrayExpression" ||
    node.type === "ArrayPattern" ||
    (node.type === "UnaryExpression" &&
      node.prefix &&
      (node.operator === "+" || node.operator === "-")) ||
    node.type === "TemplateLiteral" ||
    node.type === "TemplateElement" ||
    isJsxNode(node) ||
    (node.type === "BindExpression" && !node.object) ||
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" && node.pattern) ||
    (node.type === "Literal" && node.regex);

  if (maybeASIProblem) {
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

/**
 * @returns {boolean}
 */
function classPropMayCauseASIProblems(node) {
  if (node.type !== "ClassProperty" && node.type !== "PropertyDefinition") {
    return false;
  }

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

  return false;
}

/**
 * @returns {boolean}
 */
function classChildNeedsASIProtection(node) {
  if (!node) {
    return;
  }

  if (
    node.static ||
    node.accessibility // TypeScript
  ) {
    return false;
  }

  if (!node.computed) {
    const name = node.key && node.key.name;
    if (name === "in" || name === "instanceof") {
      return true;
    }
  }
  switch (node.type) {
    case "ClassProperty":
    case "PropertyDefinition":
    case "TSAbstractClassProperty":
      return node.computed;
    case "MethodDefinition": // Flow
    case "TSAbstractMethodDefinition": // TypeScript
    case "ClassMethod":
    case "ClassPrivateMethod": {
      // Babel
      const isAsync = node.value ? node.value.async : node.async;
      const isGenerator = node.value ? node.value.generator : node.generator;
      if (isAsync || node.kind === "get" || node.kind === "set") {
        return false;
      }
      if (node.computed || isGenerator) {
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
