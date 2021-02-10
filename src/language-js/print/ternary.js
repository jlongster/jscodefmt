"use strict";

const flat = require("lodash/flatten");
const { hasNewlineInRange } = require("../../common/util");
const {
  isJsxNode,
  isBlockComment,
  getComments,
  isChainElement,
  isCallExpression,
  isMemberExpression,
} = require("../utils");
const { locStart, locEnd } = require("../loc");
const {
  builders: {
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
 * @typedef {import("../../common/ast-path")} AstPath
 *
 * @typedef {any} Options - Prettier options (TBD ...)
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

function conditionalExpressionChainContainsJsx(node) {
  return getConditionalChainContents(node).some(isJsxNode);
}

function printTernaryTest(path, options, print) {
  const node = path.getValue();
  const isConditionalExpression = node.type === "ConditionalExpression";
  const alternateNodePropertyName = isConditionalExpression
    ? "alternate"
    : "falseType";

  const parent = path.getParentNode();

  const printed = isConditionalExpression
    ? path.call(print, "test")
    : [
        path.call(print, "checkType"),
        " ",
        "extends",
        " ",
        path.call(print, "extendsType"),
      ];
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
  if (parent.type === node.type && parent[alternateNodePropertyName] === node) {
    return align(2, printed);
  }
  return printed;
}

const ancestorNameMap = new Map([
  ["AssignmentExpression", "right"],
  ["VariableDeclarator", "init"],
  ["ReturnStatement", "argument"],
  ["ThrowStatement", "argument"],
  ["UnaryExpression", "argument"],
  ["YieldExpression", "argument"],
]);
function shouldExtraIndentForConditionalExpression(path) {
  const node = path.getValue();
  if (node.type !== "ConditionalExpression") {
    return false;
  }

  let ancestorCount = 1;
  let ancestor = path.getParentNode(ancestorCount);
  if (!ancestor) {
    return false;
  }
  while (isChainElement(ancestor)) {
    ancestor = path.getParentNode(++ancestorCount);
  }
  const checkAncestor = (node) => {
    const name = ancestorNameMap.get(ancestor.type);
    return ancestor[name] === node;
  };

  const parent = path.getParentNode();
  const name = path.getName();

  if (
    ((name === "callee" && parent.type === "NewExpression") ||
      (name === "expression" && parent.type === "TSAsExpression")) &&
    checkAncestor(parent)
  ) {
    return true;
  }

  if (
    ((name === "callee" && isCallExpression(parent)) ||
      (name === "object" && isMemberExpression(parent)) ||
      (name === "expression" && parent.type === "TSNonNullExpression")) &&
    checkAncestor(path.getParentNode(ancestorCount - 1))
  ) {
    return true;
  }

  return false;
}

/**
 * The following is the shared logic for
 * ternary operators, namely ConditionalExpression
 * and TSConditionalType
 * @param {AstPath} path - The path to the ConditionalExpression/TSConditionalType node.
 * @param {Options} options - Prettier options
 * @param {Function} print - Print function to call recursively
 * @returns {Doc}
 */
function printTernary(path, options, print) {
  const node = path.getValue();
  const isConditionalExpression = node.type === "ConditionalExpression";
  const consequentNodePropertyName = isConditionalExpression
    ? "consequent"
    : "trueType";
  const alternateNodePropertyName = isConditionalExpression
    ? "alternate"
    : "falseType";
  const testNodePropertyNames = isConditionalExpression
    ? ["test"]
    : ["checkType", "extendsType"];
  const consequentNode = node[consequentNodePropertyName];
  const alternateNode = node[alternateNodePropertyName];
  const parts = [];

  // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See tests/jsx/conditional-expression.js for more info.
  let jsxMode = false;
  const parent = path.getParentNode();
  const isParentTest =
    parent.type === node.type &&
    testNodePropertyNames.some((prop) => parent[prop] === node);
  let forceNoIndent = parent.type === node.type && !isParentTest;

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
    currentParent.type === node.type &&
    testNodePropertyNames.every(
      (prop) => currentParent[prop] !== previousParent
    )
  );
  const firstNonConditionalParent = currentParent || parent;
  const lastConditionalParent = previousParent;

  if (
    isConditionalExpression &&
    (isJsxNode(node[testNodePropertyNames[0]]) ||
      isJsxNode(consequentNode) ||
      isJsxNode(alternateNode) ||
      conditionalExpressionChainContainsJsx(lastConditionalParent))
  ) {
    jsxMode = true;
    forceNoIndent = true;

    // Even though they don't need parens, we wrap (almost) everything in
    // parens when using ?: within JSX, because the parens are analogous to
    // curly braces in an if statement.
    const wrap = (doc) => [
      ifBreak("("),
      indent([softline, doc]),
      softline,
      ifBreak(")"),
    ];

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
        ? path.call(print, consequentNodePropertyName)
        : wrap(path.call(print, consequentNodePropertyName)),
      " : ",
      alternateNode.type === node.type || isNil(alternateNode)
        ? path.call(print, alternateNodePropertyName)
        : wrap(path.call(print, alternateNodePropertyName))
    );
  } else {
    // normal mode
    const part = [
      line,
      "? ",
      consequentNode.type === node.type ? ifBreak("", "(") : "",
      align(2, path.call(print, consequentNodePropertyName)),
      consequentNode.type === node.type ? ifBreak("", ")") : "",
      line,
      ": ",
      alternateNode.type === node.type
        ? path.call(print, alternateNodePropertyName)
        : align(2, path.call(print, alternateNodePropertyName)),
    ];
    parts.push(
      parent.type !== node.type ||
        parent[alternateNodePropertyName] === node ||
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
    ...testNodePropertyNames.map((propertyName) =>
      getComments(node[propertyName])
    ),
    getComments(consequentNode),
    getComments(alternateNode),
  ]);
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
      ? [doc, breakParent]
      : doc;

  // Break the closing paren to keep the chain right after it:
  // (a
  //   ? b
  //   : c
  // ).call()
  const breakClosingParen =
    !jsxMode &&
    (isMemberExpression(parent) ||
      (parent.type === "NGPipeExpression" && parent.left === node)) &&
    !parent.computed;

  const shouldExtraIndent = shouldExtraIndentForConditionalExpression(path);

  const result = maybeGroup([
    printTernaryTest(path, options, print),
    forceNoIndent ? parts : indent(parts),
    isConditionalExpression && breakClosingParen && !shouldExtraIndent
      ? softline
      : "",
  ]);

  return isParentTest || shouldExtraIndent
    ? group([indent([softline, result]), softline])
    : result;
}

module.exports = { printTernary };
