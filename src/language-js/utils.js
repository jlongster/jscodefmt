"use strict";

const {
  getLast,
  hasNewline,
  hasNewlineInRange,
  hasIgnoreComment,
  hasNodeIgnoreComment,
  skipWhitespace,
  skipInlineComment,
  skipTrailingComment,
} = require("../common/util");
const isIdentifierName = require("esutils").keyword.isIdentifierNameES5;
const handleComments = require("./comments");

// We match any whitespace except line terminators because
// Flow annotation comments cannot be split across lines. For example:
//
// (this /*
// : any */).foo = 5;
//
// is not picked up by Flow (see https://github.com/facebook/flow/issues/7050), so
// removing the newline would create a type annotation that the user did not intend
// to create.
const NON_LINE_TERMINATING_WHITE_SPACE = "(?:(?=.)\\s)";
const FLOW_SHORTHAND_ANNOTATION = new RegExp(
  `^${NON_LINE_TERMINATING_WHITE_SPACE}*:`
);
const FLOW_ANNOTATION = new RegExp(`^${NON_LINE_TERMINATING_WHITE_SPACE}*::`);

function hasFlowShorthandAnnotationComment(node) {
  // https://flow.org/en/docs/types/comments/
  // Syntax example: const r = new (window.Request /*: Class<Request> */)("");

  return (
    node.extra &&
    node.extra.parenthesized &&
    node.trailingComments &&
    node.trailingComments[0].value.match(FLOW_SHORTHAND_ANNOTATION)
  );
}

function hasFlowAnnotationComment(comments) {
  return comments && comments[0].value.match(FLOW_ANNOTATION);
}

function hasNode(node, fn) {
  if (!node || typeof node !== "object") {
    return false;
  }
  if (Array.isArray(node)) {
    return node.some((value) => hasNode(value, fn));
  }
  const result = fn(node);
  return typeof result === "boolean"
    ? result
    : Object.keys(node).some((key) => hasNode(node[key], fn));
}

function hasNakedLeftSide(node) {
  return (
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "NGPipeExpression" ||
    node.type === "ConditionalExpression" ||
    node.type === "CallExpression" ||
    node.type === "OptionalCallExpression" ||
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "TaggedTemplateExpression" ||
    node.type === "BindExpression" ||
    (node.type === "UpdateExpression" && !node.prefix) ||
    node.type === "TSAsExpression" ||
    node.type === "TSNonNullExpression"
  );
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return (
    node.left ||
    node.test ||
    node.callee ||
    node.object ||
    node.tag ||
    node.argument ||
    node.expression
  );
}

function getLeftSidePathName(path, node) {
  if (node.expressions) {
    return ["expressions", 0];
  }
  if (node.left) {
    return ["left"];
  }
  if (node.test) {
    return ["test"];
  }
  if (node.object) {
    return ["object"];
  }
  if (node.callee) {
    return ["callee"];
  }
  if (node.tag) {
    return ["tag"];
  }
  if (node.argument) {
    return ["argument"];
  }
  if (node.expression) {
    return ["expression"];
  }
  throw new Error("Unexpected node has no left side", node);
}

const exportDeclarationTypes = new Set([
  "ExportDefaultDeclaration",
  "ExportDefaultSpecifier",
  "DeclareExportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
]);
function isExportDeclaration(node) {
  return node && exportDeclarationTypes.has(node.type);
}

function getParentExportDeclaration(path) {
  const parentNode = path.getParentNode();
  if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
    return parentNode;
  }

  return null;
}

function isLiteral(node) {
  return (
    node.type === "BooleanLiteral" ||
    node.type === "DirectiveLiteral" ||
    node.type === "Literal" ||
    node.type === "NullLiteral" ||
    node.type === "NumericLiteral" ||
    node.type === "BigIntLiteral" ||
    node.type === "RegExpLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "TemplateLiteral" ||
    node.type === "TSTypeLiteral" ||
    node.type === "JSXText"
  );
}

function isLiteralLikeValue(node) {
  return (
    isLiteral(node) ||
    (node.type === "Identifier" && /^[A-Z_]+$/.test(node.name)) ||
    (node.type === "ArrayExpression" &&
      node.elements.every(
        (element) => element !== null && isLiteralLikeValue(element)
      )) ||
    (node.type === "ObjectExpression" &&
      node.properties.every(
        (property) =>
          !property.computed &&
          property.value &&
          isLiteralLikeValue(property.value)
      ))
  );
}

function isNumericLiteral(node) {
  return (
    node.type === "NumericLiteral" ||
    (node.type === "Literal" && typeof node.value === "number")
  );
}

function isStringLiteral(node) {
  return (
    node.type === "StringLiteral" ||
    (node.type === "Literal" && typeof node.value === "string")
  );
}

function isObjectType(n) {
  return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral";
}

function isFunctionOrArrowExpression(node) {
  return (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

function isFunctionOrArrowExpressionWithBody(node) {
  return (
    node.type === "FunctionExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      node.body.type === "BlockStatement")
  );
}

function isTemplateLiteral(node) {
  return node.type === "TemplateLiteral";
}

// `inject` is used in AngularJS 1.x, `async` in Angular 2+
// example: https://docs.angularjs.org/guide/unit-testing#using-beforeall-
function isAngularTestWrapper(node) {
  return (
    (node.type === "CallExpression" ||
      node.type === "OptionalCallExpression") &&
    node.callee.type === "Identifier" &&
    (node.callee.name === "async" ||
      node.callee.name === "inject" ||
      node.callee.name === "fakeAsync")
  );
}

function isJSXNode(node) {
  return node.type === "JSXElement" || node.type === "JSXFragment";
}

function isTheOnlyJSXElementInMarkdown(options, path) {
  if (options.parentParser !== "markdown" && options.parentParser !== "mdx") {
    return false;
  }

  const node = path.getNode();

  if (!node.expression || !isJSXNode(node.expression)) {
    return false;
  }

  const parent = path.getParentNode();

  return parent.type === "Program" && parent.body.length === 1;
}

// Detect an expression node representing `{" "}`
function isJSXWhitespaceExpression(node) {
  return (
    node.type === "JSXExpressionContainer" &&
    isLiteral(node.expression) &&
    node.expression.value === " " &&
    !node.expression.comments
  );
}

function isMemberExpressionChain(node) {
  if (
    node.type !== "MemberExpression" &&
    node.type !== "OptionalMemberExpression"
  ) {
    return false;
  }
  if (node.object.type === "Identifier") {
    return true;
  }
  return isMemberExpressionChain(node.object);
}

function isGetterOrSetter(node) {
  return node.kind === "get" || node.kind === "set";
}

function sameLocStart(nodeA, nodeB, options) {
  return options.locStart(nodeA) === options.locStart(nodeB);
}

// TODO: This is a bad hack and we need a better way to distinguish between
// arrow functions and otherwise
function isFunctionNotation(node, options) {
  return isGetterOrSetter(node) || sameLocStart(node, node.value, options);
}

// Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };
function isObjectTypePropertyAFunction(node, options) {
  return (
    (node.type === "ObjectTypeProperty" ||
      node.type === "ObjectTypeInternalSlot") &&
    node.value.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !isFunctionNotation(node, options)
  );
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node, options) {
  return (
    (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !sameLocStart(node, node.typeAnnotation, options)
  );
}

const binaryishNodeTypes = new Set([
  "BinaryExpression",
  "LogicalExpression",
  "NGPipeExpression",
]);
function isBinaryish(node) {
  return binaryishNodeTypes.has(node.type);
}

function isMemberish(node) {
  return (
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    (node.type === "BindExpression" && node.object)
  );
}

const flowTypeAnnotations = new Set([
  "AnyTypeAnnotation",
  "NullLiteralTypeAnnotation",
  "GenericTypeAnnotation",
  "ThisTypeAnnotation",
  "NumberTypeAnnotation",
  "VoidTypeAnnotation",
  "EmptyTypeAnnotation",
  "MixedTypeAnnotation",
  "BooleanTypeAnnotation",
  "BooleanLiteralTypeAnnotation",
  "StringTypeAnnotation",
]);
function isSimpleFlowType(node) {
  return (
    node &&
    flowTypeAnnotations.has(node.type) &&
    !(node.type === "GenericTypeAnnotation" && node.typeParameters)
  );
}

const unitTestRe = /^(skip|[fx]?(it|describe|test))$/;

function isSkipOrOnlyBlock(node) {
  return (
    (node.callee.type === "MemberExpression" ||
      node.callee.type === "OptionalMemberExpression") &&
    node.callee.object.type === "Identifier" &&
    node.callee.property.type === "Identifier" &&
    unitTestRe.test(node.callee.object.name) &&
    (node.callee.property.name === "only" ||
      node.callee.property.name === "skip")
  );
}

function isUnitTestSetUp(n) {
  const unitTestSetUpRe = /^(before|after)(Each|All)$/;
  return (
    n.callee.type === "Identifier" &&
    unitTestSetUpRe.test(n.callee.name) &&
    n.arguments.length === 1
  );
}

// eg; `describe("some string", (done) => {})`
function isTestCall(n, parent) {
  if (n.type !== "CallExpression") {
    return false;
  }
  if (n.arguments.length === 1) {
    if (isAngularTestWrapper(n) && parent && isTestCall(parent)) {
      return isFunctionOrArrowExpression(n.arguments[0]);
    }

    if (isUnitTestSetUp(n)) {
      return isAngularTestWrapper(n.arguments[0]);
    }
  } else if (n.arguments.length === 2 || n.arguments.length === 3) {
    if (
      ((n.callee.type === "Identifier" && unitTestRe.test(n.callee.name)) ||
        isSkipOrOnlyBlock(n)) &&
      (isTemplateLiteral(n.arguments[0]) || isStringLiteral(n.arguments[0]))
    ) {
      // it("name", () => { ... }, 2500)
      if (n.arguments[2] && !isNumericLiteral(n.arguments[2])) {
        return false;
      }
      return (
        (n.arguments.length === 2
          ? isFunctionOrArrowExpression(n.arguments[1])
          : isFunctionOrArrowExpressionWithBody(n.arguments[1]) &&
            n.arguments[1].params.length <= 1) ||
        isAngularTestWrapper(n.arguments[1])
      );
    }
  }
  return false;
}

function hasLeadingComment(node) {
  return node.comments && node.comments.some((comment) => comment.leading);
}

function hasTrailingComment(node) {
  return node.comments && node.comments.some((comment) => comment.trailing);
}

function isCallOrOptionalCallExpression(node) {
  return (
    node.type === "CallExpression" || node.type === "OptionalCallExpression"
  );
}

function hasDanglingComments(node) {
  return (
    node.comments &&
    node.comments.some((comment) => !comment.leading && !comment.trailing)
  );
}

/** identify if an angular expression seems to have side effects */
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

function isNgForOf(node, index, parentNode) {
  return (
    node.type === "NGMicrosyntaxKeyedExpression" &&
    node.key.name === "of" &&
    index === 1 &&
    parentNode.body[0].type === "NGMicrosyntaxLet" &&
    parentNode.body[0].value === null
  );
}

/** @param node {import("estree").TemplateLiteral} */
function isSimpleTemplateLiteral(node) {
  if (node.expressions.length === 0) {
    return false;
  }

  return node.expressions.every((expr) => {
    // Disallow comments since printDocToString can't print them here
    if (expr.comments) {
      return false;
    }

    // Allow `x` and `this`
    if (expr.type === "Identifier" || expr.type === "ThisExpression") {
      return true;
    }

    // Allow `a.b.c`, `a.b[c]`, and `this.x.y`
    if (
      expr.type === "MemberExpression" ||
      expr.type === "OptionalMemberExpression"
    ) {
      let head = expr;
      while (
        head.type === "MemberExpression" ||
        head.type === "OptionalMemberExpression"
      ) {
        if (
          head.property.type !== "Identifier" &&
          head.property.type !== "Literal" &&
          head.property.type !== "StringLiteral" &&
          head.property.type !== "NumericLiteral"
        ) {
          return false;
        }
        head = head.object;
        if (head.comments) {
          return false;
        }
      }

      if (head.type === "Identifier" || head.type === "ThisExpression") {
        return true;
      }

      return false;
    }

    return false;
  });
}

function getFlowVariance(path) {
  if (!path.variance) {
    return null;
  }

  // Babel 7.0 currently uses variance node type, and flow should
  // follow suit soon:
  // https://github.com/babel/babel/issues/4722
  const variance = path.variance.kind || path.variance;

  switch (variance) {
    case "plus":
      return "+";
    case "minus":
      return "-";
    default:
      /* istanbul ignore next */
      return variance;
  }
}

function classPropMayCauseASIProblems(path) {
  const node = path.getNode();

  if (node.type !== "ClassProperty") {
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
}

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
    default:
      /* istanbul ignore next */
      return false;
  }
}

function getTypeScriptMappedTypeModifier(tokenNode, keyword) {
  if (tokenNode === "+") {
    return "+" + keyword;
  } else if (tokenNode === "-") {
    return "-" + keyword;
  }
  return keyword;
}

function hasNewlineBetweenOrAfterDecorators(node, options) {
  return (
    hasNewlineInRange(
      options.originalText,
      options.locStart(node.decorators[0]),
      options.locEnd(getLast(node.decorators))
    ) ||
    hasNewline(options.originalText, options.locEnd(getLast(node.decorators)))
  );
}

// Only space, newline, carriage return, and tab are treated as whitespace
// inside JSX.
const jsxWhitespaceChars = " \n\r\t";
const matchJsxWhitespaceRegex = new RegExp("([" + jsxWhitespaceChars + "]+)");
const containsNonJsxWhitespaceRegex = new RegExp(
  "[^" + jsxWhitespaceChars + "]"
);

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
function isMeaningfulJSXText(node) {
  return (
    isLiteral(node) &&
    (containsNonJsxWhitespaceRegex.test(rawText(node)) ||
      !/\n/.test(rawText(node)))
  );
}

function hasJsxIgnoreComment(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  if (!parent || !node || !isJSXNode(node) || !isJSXNode(parent)) {
    return false;
  }

  // Lookup the previous sibling, ignoring any empty JSXText elements
  const index = parent.children.indexOf(node);
  let prevSibling = null;
  for (let i = index; i > 0; i--) {
    const candidate = parent.children[i - 1];
    if (candidate.type === "JSXText" && !isMeaningfulJSXText(candidate)) {
      continue;
    }
    prevSibling = candidate;
    break;
  }

  return (
    prevSibling &&
    prevSibling.type === "JSXExpressionContainer" &&
    prevSibling.expression.type === "JSXEmptyExpression" &&
    prevSibling.expression.comments &&
    prevSibling.expression.comments.find(
      (comment) => comment.value.trim() === "prettier-ignore"
    )
  );
}

function isEmptyJSXElement(node) {
  if (node.children.length === 0) {
    return true;
  }
  if (node.children.length > 1) {
    return false;
  }

  // if there is one text child and does not contain any meaningful text
  // we can treat the element as empty.
  const child = node.children[0];
  return isLiteral(child) && !isMeaningfulJSXText(child);
}

function hasPrettierIgnore(path) {
  return hasIgnoreComment(path) || hasJsxIgnoreComment(path);
}

function isLastStatement(path) {
  const parent = path.getParentNode();
  if (!parent) {
    return true;
  }
  const node = path.getValue();
  const body = (parent.body || parent.consequent).filter(
    (stmt) => stmt.type !== "EmptyStatement"
  );
  return body && body[body.length - 1] === node;
}

function isFlowAnnotationComment(text, typeAnnotation, options) {
  const start = options.locStart(typeAnnotation);
  const end = skipWhitespace(text, options.locEnd(typeAnnotation));
  return (
    text.slice(start, start + 2) === "/*" && text.slice(end, end + 2) === "*/"
  );
}

function hasLeadingOwnLineComment(text, node, options) {
  if (isJSXNode(node)) {
    return hasNodeIgnoreComment(node);
  }

  const res =
    node.comments &&
    node.comments.some(
      (comment) => comment.leading && hasNewline(text, options.locEnd(comment))
    );
  return res;
}

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument, options)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    let leftMost = argument;
    let newLeftMost;
    while ((newLeftMost = getLeftSide(leftMost))) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost, options)) {
        return true;
      }
    }
  }

  return false;
}

function isStringPropSafeToCoerceToIdentifier(node, options) {
  return (
    isStringLiteral(node.key) &&
    isIdentifierName(node.key.value) &&
    rawText(node.key).slice(1, -1) === node.key.value &&
    options.parser !== "json" &&
    // With `--strictPropertyInitialization`, TS treats properties with quoted names differently than unquoted ones.
    // See https://github.com/microsoft/TypeScript/pull/20075
    !(
      (options.parser === "typescript" || options.parser === "babel-ts") &&
      node.type === "ClassProperty"
    )
  );
}

function isJestEachTemplateLiteral(node, parentNode) {
  /**
   * describe.each`table`(name, fn)
   * describe.only.each`table`(name, fn)
   * describe.skip.each`table`(name, fn)
   * test.each`table`(name, fn)
   * test.only.each`table`(name, fn)
   * test.skip.each`table`(name, fn)
   *
   * Ref: https://github.com/facebook/jest/pull/6102
   */
  const jestEachTriggerRegex = /^[fx]?(describe|it|test)$/;
  return (
    parentNode.type === "TaggedTemplateExpression" &&
    parentNode.quasi === node &&
    parentNode.tag.type === "MemberExpression" &&
    parentNode.tag.property.type === "Identifier" &&
    parentNode.tag.property.name === "each" &&
    ((parentNode.tag.object.type === "Identifier" &&
      jestEachTriggerRegex.test(parentNode.tag.object.name)) ||
      (parentNode.tag.object.type === "MemberExpression" &&
        parentNode.tag.object.property.type === "Identifier" &&
        (parentNode.tag.object.property.name === "only" ||
          parentNode.tag.object.property.name === "skip") &&
        parentNode.tag.object.object.type === "Identifier" &&
        jestEachTriggerRegex.test(parentNode.tag.object.object.name)))
  );
}

function templateLiteralHasNewLines(template) {
  return template.quasis.some((quasi) => quasi.value.raw.includes("\n"));
}

function isTemplateOnItsOwnLine(n, text, options) {
  return (
    ((n.type === "TemplateLiteral" && templateLiteralHasNewLines(n)) ||
      (n.type === "TaggedTemplateExpression" &&
        templateLiteralHasNewLines(n.quasi))) &&
    !hasNewline(text, options.locStart(n), { backwards: true })
  );
}

function needsHardlineAfterDanglingComment(node) {
  if (!node.comments) {
    return false;
  }
  const lastDanglingComment = getLast(
    node.comments.filter((comment) => !comment.leading && !comment.trailing)
  );
  return (
    lastDanglingComment && !handleComments.isBlockComment(lastDanglingComment)
  );
}

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
  return Boolean(getConditionalChainContents(node).find(isJSXNode));
}

// Logic to check for args with multiple anonymous functions. For instance,
// the following call should be split on multiple lines for readability:
// source.pipe(map((x) => x + x), filter((x) => x % 2 === 0))
function isFunctionCompositionArgs(args) {
  if (args.length <= 1) {
    return false;
  }
  let count = 0;
  for (const arg of args) {
    if (isFunctionOrArrowExpression(arg)) {
      count += 1;
      if (count > 1) {
        return true;
      }
    } else if (isCallOrOptionalCallExpression(arg)) {
      for (const childArg of arg.arguments) {
        if (isFunctionOrArrowExpression(childArg)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Logic to determine if a call is a “long curried function call”.
// See https://github.com/prettier/prettier/issues/1420.
//
// `connect(a, b, c)(d)`
// In the above call expression, the second call is the parent node and the
// first call is the current node.
function isLongCurriedCallExpression(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  return (
    isCallOrOptionalCallExpression(node) &&
    isCallOrOptionalCallExpression(parent) &&
    parent.callee === node &&
    node.arguments.length > parent.arguments.length &&
    parent.arguments.length > 0
  );
}

/**
 * @param {import('estree').Node} node
 * @param {number} depth
 * @returns {boolean}
 */
function isSimpleCallArgument(node, depth) {
  if (depth >= 3) {
    return false;
  }

  const plusOne = (node) => isSimpleCallArgument(node, depth + 1);
  const plusTwo = (node) => isSimpleCallArgument(node, depth + 2);

  const regexpPattern =
    (node.type === "Literal" && node.regex && node.regex.pattern) ||
    (node.type === "RegExpLiteral" && node.pattern);

  if (regexpPattern && regexpPattern.length > 5) {
    return false;
  }

  if (
    node.type === "Literal" ||
    node.type === "BigIntLiteral" ||
    node.type === "BooleanLiteral" ||
    node.type === "NullLiteral" ||
    node.type === "NumericLiteral" ||
    node.type === "RegExpLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "Identifier" ||
    node.type === "ThisExpression" ||
    node.type === "Super" ||
    node.type === "PrivateName" ||
    node.type === "ArgumentPlaceholder" ||
    node.type === "Import"
  ) {
    return true;
  }

  if (node.type === "TemplateLiteral") {
    return node.expressions.every(plusTwo);
  }

  if (node.type === "ObjectExpression") {
    return node.properties.every(
      (p) => !p.computed && (p.shorthand || (p.value && plusTwo(p.value)))
    );
  }

  if (node.type === "ArrayExpression") {
    return node.elements.every((x) => x === null || plusTwo(x));
  }

  if (
    node.type === "CallExpression" ||
    node.type === "OptionalCallExpression" ||
    node.type === "NewExpression"
  ) {
    return plusOne(node.callee, depth) && node.arguments.every(plusTwo);
  }

  if (
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression"
  ) {
    return plusOne(node.object, depth) && plusOne(node.property, depth);
  }

  if (
    node.type === "UnaryExpression" &&
    (node.operator === "!" || node.operator === "-")
  ) {
    return plusOne(node.argument, depth);
  }

  if (node.type === "TSNonNullExpression") {
    return plusOne(node.expression, depth);
  }

  return false;
}

function rawText(node) {
  return node.extra ? node.extra.raw : node.raw;
}

function identity(x) {
  return x;
}

function isTSXFile(options) {
  return options.filepath && /\.tsx$/i.test(options.filepath);
}

function shouldPrintComma(options, level) {
  level = level || "es5";

  switch (options.trailingComma) {
    case "all":
      if (level === "all") {
        return true;
      }
    // fallthrough
    case "es5":
      if (level === "es5") {
        return true;
      }
    // fallthrough
    case "none":
    default:
      return false;
  }
}

/**
 * @param {string} text
 * @param {number} idx
 * @returns {number | false}
 */
function getNextNonCommentCharacterIndexWithStartIndex(text, idx) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let nextIdx = idx;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skipInlineComment(text, nextIdx);
    nextIdx = skipTrailingComment(text, nextIdx);
  }
  return nextIdx;
}

function stripComments(text) {
  let result = "";
  let index = 0;
  while (index < text.length) {
    index = getNextNonCommentCharacterIndexWithStartIndex(text, index);
    result += text.charAt(index);
    index++;
  }
  return result;
}

module.exports = {
  classChildNeedsASIProtection,
  classPropMayCauseASIProblems,
  conditionalExpressionChainContainsJSX,
  getFlowVariance,
  getLeftSidePathName,
  getParentExportDeclaration,
  getTypeScriptMappedTypeModifier,
  hasDanglingComments,
  hasFlowAnnotationComment,
  hasFlowShorthandAnnotationComment,
  hasLeadingComment,
  hasLeadingOwnLineComment,
  hasNakedLeftSide,
  hasNewlineBetweenOrAfterDecorators,
  hasNgSideEffect,
  hasNode,
  hasPrettierIgnore,
  hasTrailingComment,
  identity,
  isBinaryish,
  isCallOrOptionalCallExpression,
  isEmptyJSXElement,
  isExportDeclaration,
  isFlowAnnotationComment,
  isFunctionCompositionArgs,
  isFunctionNotation,
  isFunctionOrArrowExpression,
  isGetterOrSetter,
  isJestEachTemplateLiteral,
  isJSXNode,
  isJSXWhitespaceExpression,
  isLastStatement,
  isLiteral,
  isLiteralLikeValue,
  isLongCurriedCallExpression,
  isSimpleCallArgument,
  isMeaningfulJSXText,
  isMemberExpressionChain,
  isMemberish,
  isNgForOf,
  isNumericLiteral,
  isObjectType,
  isObjectTypePropertyAFunction,
  isSimpleFlowType,
  isSimpleTemplateLiteral,
  isStringLiteral,
  isStringPropSafeToCoerceToIdentifier,
  isTemplateOnItsOwnLine,
  isTestCall,
  isTheOnlyJSXElementInMarkdown,
  isTSXFile,
  isTypeAnnotationAFunction,
  matchJsxWhitespaceRegex,
  needsHardlineAfterDanglingComment,
  rawText,
  returnArgumentHasLeadingComment,
  shouldPrintComma,
  stripComments,
};
