"use strict";

const flat = require("lodash/flatten");
const { hasNewlineInRange } = require("../../common/util");
const { isJSXNode, isBlockComment } = require("../utils");
const { locStart, locEnd } = require("../loc");
const {
  builders: {
    concat,
    line,
    softline,
    group,
    indent,
    align,
    ifBreak,
    dedent,
    breakParent,
  },
} = require("../../document");

/**
 * @typedef {import("../../document").Doc} Doc
 * @typedef {import("../../common/fast-path")} FastPath
 *
 * @typedef {any} Options - Prettier options (TBD ...)
 *
 * @typedef {Object} OperatorOptions
 * @property {() => Array<string | Doc>} beforeParts - Parts to print before the `?`.
 * @property {(breakClosingParen: boolean) => Array<string | Doc>} afterParts - Parts to print after the conditional expression.
 * @property {boolean} shouldCheckJsx - Whether to check for and print in JSX mode.
 * @property {string} conditionalNodeType - The type of the conditional expression node, ie "ConditionalExpression" or "TSConditionalType".
 * @property {string} consequentNodePropertyName - The property at which the consequent node can be found on the main node, eg "consequent".
 * @property {string} alternateNodePropertyName - The property at which the alternate node can be found on the main node, eg "alternate".
 * @property {string[]} testNodePropertyNames - The properties at which the test nodes can be found on the main node, eg "test".
 */

// If we have nested conditional expressions, we want to print them in JSX mode
// if there's at least one JSXElement somewhere in the tree.
//
// A conditional expression chain like this should be printed in normal mode,
// because there aren't JSXElements anywhere in it:
//
// isA ? "A" : isB ? "B" : isC ? "C" : "Unknown";
//
// But a conditional expression chain like this should be printed in JSX mode,
// because there is a JSXElement in the last ConditionalExpression:
//
// isA ? "A" : isB ? "B" : isC ? "C" : <span className="warning">Unknown</span>;
//
// This type of ConditionalExpression chain is structured like this in the AST:
//
// ConditionalExpression {
//   test: ...,
//   consequent: ...,
//   alternate: ConditionalExpression {
//     test: ...,
//     consequent: ...,
//     alternate: ConditionalExpression {
//       test: ...,
//       consequent: ...,
//       alternate: ...,
//     }
//   }
// }
//
// We want to traverse over that shape and convert it into a flat structure so
// that we can find if there's a JSXElement somewhere inside.
function getConditionalChainContents(node) {
  // Given this code:
  //
  // // Using a ConditionalExpression as the consequent is uncommon, but should
  // // be handled.
  // A ? B : C ? D : E ? F ? G : H : I
  //
  // which has this AST:
  //
  // ConditionalExpression {
  //   test: Identifier(A),
  //   consequent: Identifier(B),
  //   alternate: ConditionalExpression {
  //     test: Identifier(C),
  //     consequent: Identifier(D),
  //     alternate: ConditionalExpression {
  //       test: Identifier(E),
  //       consequent: ConditionalExpression {
  //         test: Identifier(F),
  //         consequent: Identifier(G),
  //         alternate: Identifier(H),
  //       },
  //       alternate: Identifier(I),
  //     }
  //   }
  // }
  //
  // we should return this Array:
  //
  // [
  //   Identifier(A),
  //   Identifier(B),
  //   Identifier(C),
  //   Identifier(D),
  //   Identifier(E),
  //   Identifier(F),
  //   Identifier(G),
  //   Identifier(H),
  //   Identifier(I)
  // ];
  //
  // This loses the information about whether each node was the test,
  // consequent, or alternate, but we don't care about that here- we are only
  // flattening this structure to find if there's any JSXElements inside.
  const nonConditionalExpressions = [];

  function recurse(node) {
    if (node.type === "ConditionalExpression") {
      recurse(node.test);
      recurse(node.consequent);
      recurse(node.alternate);
    } else {
      nonConditionalExpressions.push(node);
    }
  }
  recurse(node);

  return nonConditionalExpressions;
}

function conditionalExpressionChainContainsJSX(node) {
  return getConditionalChainContents(node).some(isJSXNode);
}

/**
 * The following is the shared logic for
 * ternary operators, namely ConditionalExpression
 * and TSConditionalType
 * @param {FastPath} path - The path to the ConditionalExpression/TSConditionalType node.
 * @param {Options} options - Prettier options
 * @param {Function} print - Print function to call recursively
 * @param {OperatorOptions} operatorOptions
 * @returns {Doc}
 */
function printTernaryOperator(path, options, print, operatorOptions) {
  const node = path.getValue();
  const consequentNode = node[operatorOptions.consequentNodePropertyName];
  const alternateNode = node[operatorOptions.alternateNodePropertyName];
  const parts = [];

  // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See tests/jsx/conditional-expression.js for more info.
  let jsxMode = false;
  const parent = path.getParentNode();
  const isParentTest =
    parent.type === operatorOptions.conditionalNodeType &&
    operatorOptions.testNodePropertyNames.some((prop) => parent[prop] === node);
  let forceNoIndent =
    parent.type === operatorOptions.conditionalNodeType && !isParentTest;

  // Find the outermost non-ConditionalExpression parent, and the outermost
  // ConditionalExpression parent. We'll use these to determine if we should
  // print in JSX mode.
  let currentParent;
  let previousParent;
  let i = 0;
  do {
    previousParent = currentParent || node;
    currentParent = path.getParentNode(i);
    i++;
  } while (
    currentParent &&
    currentParent.type === operatorOptions.conditionalNodeType &&
    operatorOptions.testNodePropertyNames.every(
      (prop) => currentParent[prop] !== previousParent
    )
  );
  const firstNonConditionalParent = currentParent || parent;
  const lastConditionalParent = previousParent;

  if (
    operatorOptions.shouldCheckJsx &&
    (isJSXNode(node[operatorOptions.testNodePropertyNames[0]]) ||
      isJSXNode(consequentNode) ||
      isJSXNode(alternateNode) ||
      conditionalExpressionChainContainsJSX(lastConditionalParent))
  ) {
    jsxMode = true;
    forceNoIndent = true;

    // Even though they don't need parens, we wrap (almost) everything in
    // parens when using ?: within JSX, because the parens are analogous to
    // curly braces in an if statement.
    const wrap = (doc) =>
      concat([
        ifBreak("(", ""),
        indent(concat([softline, doc])),
        softline,
        ifBreak(")", ""),
      ]);

    // The only things we don't wrap are:
    // * Nested conditional expressions in alternates
    // * null
    // * undefined
    const isNil = (node) =>
      node.type === "NullLiteral" ||
      (node.type === "Literal" && node.value === null) ||
      (node.type === "Identifier" && node.name === "undefined");

    parts.push(
      " ? ",
      isNil(consequentNode)
        ? path.call(print, operatorOptions.consequentNodePropertyName)
        : wrap(path.call(print, operatorOptions.consequentNodePropertyName)),
      " : ",
      alternateNode.type === operatorOptions.conditionalNodeType ||
        isNil(alternateNode)
        ? path.call(print, operatorOptions.alternateNodePropertyName)
        : wrap(path.call(print, operatorOptions.alternateNodePropertyName))
    );
  } else {
    // normal mode
    const part = concat([
      line,
      "? ",
      consequentNode.type === operatorOptions.conditionalNodeType
        ? ifBreak("", "(")
        : "",
      align(2, path.call(print, operatorOptions.consequentNodePropertyName)),
      consequentNode.type === operatorOptions.conditionalNodeType
        ? ifBreak("", ")")
        : "",
      line,
      ": ",
      align(2, path.call(print, operatorOptions.alternateNodePropertyName)),
    ]);
    parts.push(
      parent.type !== operatorOptions.conditionalNodeType ||
        parent[operatorOptions.alternateNodePropertyName] === node ||
        isParentTest
        ? part
        : options.useTabs
        ? dedent(indent(part))
        : align(Math.max(0, options.tabWidth - 2), part)
    );
  }

  // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.
  const comments = flat([
    ...operatorOptions.testNodePropertyNames.map(
      (propertyName) => node[propertyName].comments
    ),
    consequentNode.comments,
    alternateNode.comments,
  ]).filter(Boolean);
  const shouldBreak = comments.some(
    (comment) =>
      isBlockComment(comment) &&
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment)
      )
  );
  const maybeGroup = (doc) =>
    parent === firstNonConditionalParent
      ? group(doc, { shouldBreak })
      : shouldBreak
      ? concat([doc, breakParent])
      : doc;

  // Break the closing paren to keep the chain right after it:
  // (a
  //   ? b
  //   : c
  // ).call()
  const breakClosingParen =
    !jsxMode &&
    (parent.type === "MemberExpression" ||
      parent.type === "OptionalMemberExpression" ||
      (parent.type === "NGPipeExpression" && parent.left === node)) &&
    !parent.computed;

  const result = maybeGroup(
    concat(
      [].concat(
        ((testDoc) =>
          /**
           *     a
           *       ? b
           *       : multiline
           *         test
           *         node
           *       ^^ align(2)
           *       ? d
           *       : e
           */
          parent.type === operatorOptions.conditionalNodeType &&
          parent[operatorOptions.alternateNodePropertyName] === node
            ? align(2, testDoc)
            : testDoc)(concat(operatorOptions.beforeParts())),
        forceNoIndent ? concat(parts) : indent(concat(parts)),
        operatorOptions.afterParts(breakClosingParen)
      )
    )
  );

  return isParentTest
    ? group(concat([indent(concat([softline, result])), softline]))
    : result;
}

module.exports = printTernaryOperator;
