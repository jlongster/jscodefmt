"use strict";

const isIdentifierName = require("esutils").keyword.isIdentifierNameES5;
const {
  getLast,
  hasNewline,
  skipWhitespace,
  isNonEmptyArray,
  isNextLineEmptyAfterIndex,
} = require("../common/util");
const { locStart, locEnd, hasSameLocStart } = require("./loc");

/**
 * @typedef {import("./types/estree").Node} Node
 * @typedef {import("./types/estree").TemplateLiteral} TemplateLiteral
 * @typedef {import("./types/estree").Comment} Comment
 * @typedef {import("./types/estree").MemberExpression} MemberExpression
 * @typedef {import("./types/estree").OptionalMemberExpression} OptionalMemberExpression
 * @typedef {import("./types/estree").CallExpression} CallExpression
 * @typedef {import("./types/estree").OptionalCallExpression} OptionalCallExpression
 * @typedef {import("./types/estree").Expression} Expression
 * @typedef {import("./types/estree").Property} Property
 * @typedef {import("./types/estree").ObjectTypeProperty} ObjectTypeProperty
 * @typedef {import("./types/estree").TaggedTemplateExpression} TaggedTemplateExpression
 * @typedef {import("./types/estree").Literal} Literal
 *
 * @typedef {import("../common/ast-path")} AstPath
 */

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

/**
 * @param {Node} node
 * @returns {boolean}
 */
function hasFlowShorthandAnnotationComment(node) {
  // https://flow.org/en/docs/types/comments/
  // Syntax example: const r = new (window.Request /*: Class<Request> */)("");

  return (
    node.extra &&
    node.extra.parenthesized &&
    isNonEmptyArray(node.trailingComments) &&
    isBlockComment(node.trailingComments[0]) &&
    FLOW_SHORTHAND_ANNOTATION.test(node.trailingComments[0].value)
  );
}

/**
 * @param {Comment[]} comments
 * @returns {boolean}
 */
function hasFlowAnnotationComment(comments) {
  return (
    comments &&
    isBlockComment(comments[0]) &&
    FLOW_ANNOTATION.test(comments[0].value)
  );
}

/**
 * @param {Node} node
 * @param {(Node) => boolean} fn
 * @returns {boolean}
 */
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
    : Object.values(node).some((value) => hasNode(value, fn));
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function hasNakedLeftSide(node) {
  return (
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "NGPipeExpression" ||
    node.type === "ConditionalExpression" ||
    isCallExpression(node) ||
    isMemberExpression(node) ||
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
  throw new Error("Unexpected node has no left side.");
}

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isBlockComment(comment) {
  return (
    comment.type === "Block" ||
    comment.type === "CommentBlock" ||
    // `meriyah`
    comment.type === "MultiLine"
  );
}

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isLineComment(comment) {
  return (
    comment.type === "Line" ||
    comment.type === "CommentLine" ||
    // `meriyah` has `SingleLine`, `HashbangComment`, `HTMLOpen`, and `HTMLClose`
    comment.type === "SingleLine" ||
    comment.type === "HashbangComment" ||
    comment.type === "HTMLOpen" ||
    comment.type === "HTMLClose"
  );
}

const exportDeclarationTypes = new Set([
  "ExportDefaultDeclaration",
  "ExportDefaultSpecifier",
  "DeclareExportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
]);

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isExportDeclaration(node) {
  return node && exportDeclarationTypes.has(node.type);
}

/**
 * @param {AstPath} path
 * @returns {Node | null}
 */
function getParentExportDeclaration(path) {
  const parentNode = path.getParentNode();
  if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
    return parentNode;
  }

  return null;
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isLiteral(node) {
  return (
    node.type === "BooleanLiteral" ||
    node.type === "DirectiveLiteral" ||
    node.type === "Literal" ||
    node.type === "NullLiteral" ||
    node.type === "NumericLiteral" ||
    node.type === "BigIntLiteral" ||
    node.type === "DecimalLiteral" ||
    node.type === "RegExpLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "TemplateLiteral" ||
    node.type === "TSTypeLiteral" ||
    node.type === "JSXText"
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isNumericLiteral(node) {
  return (
    node.type === "NumericLiteral" ||
    (node.type === "Literal" && typeof node.value === "number")
  );
}

function isSignedNumericLiteral(node) {
  return (
    node.type === "UnaryExpression" &&
    (node.operator === "+" || node.operator === "-") &&
    isNumericLiteral(node.argument)
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isStringLiteral(node) {
  return (
    node.type === "StringLiteral" ||
    (node.type === "Literal" && typeof node.value === "string")
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isObjectType(node) {
  return node.type === "ObjectTypeAnnotation" || node.type === "TSTypeLiteral";
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFunctionOrArrowExpression(node) {
  return (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFunctionOrArrowExpressionWithBody(node) {
  return (
    node.type === "FunctionExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      node.body.type === "BlockStatement")
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isTemplateLiteral(node) {
  return node.type === "TemplateLiteral";
}

/**
 * Note: `inject` is used in AngularJS 1.x, `async` in Angular 2+
 * example: https://docs.angularjs.org/guide/unit-testing#using-beforeall-
 *
 * @param {CallExpression} node
 * @returns {boolean}
 */
function isAngularTestWrapper(node) {
  return (
    isCallExpression(node) &&
    node.callee.type === "Identifier" &&
    (node.callee.name === "async" ||
      node.callee.name === "inject" ||
      node.callee.name === "fakeAsync")
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isJsxNode(node) {
  return node.type === "JSXElement" || node.type === "JSXFragment";
}

function isTheOnlyJsxElementInMarkdown(options, path) {
  if (options.parentParser !== "markdown" && options.parentParser !== "mdx") {
    return false;
  }

  const node = path.getNode();

  if (!node.expression || !isJsxNode(node.expression)) {
    return false;
  }

  const parent = path.getParentNode();

  return parent.type === "Program" && parent.body.length === 1;
}

function isGetterOrSetter(node) {
  return node.kind === "get" || node.kind === "set";
}

// TODO: This is a bad hack and we need a better way to distinguish between
// arrow functions and otherwise
function isFunctionNotation(node) {
  return isGetterOrSetter(node) || hasSameLocStart(node, node.value);
}

// Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isObjectTypePropertyAFunction(node) {
  return (
    (node.type === "ObjectTypeProperty" ||
      node.type === "ObjectTypeInternalSlot") &&
    node.value.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !isFunctionNotation(node)
  );
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node) {
  return (
    (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !hasSameLocStart(node, node.typeAnnotation)
  );
}

const binaryishNodeTypes = new Set([
  "BinaryExpression",
  "LogicalExpression",
  "NGPipeExpression",
]);

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isBinaryish(node) {
  return binaryishNodeTypes.has(node.type);
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMemberish(node) {
  return (
    isMemberExpression(node) ||
    (node.type === "BindExpression" && Boolean(node.object))
  );
}

const simpleTypeAnnotations = new Set([
  // `any`
  "AnyTypeAnnotation",
  "TSAnyKeyword",
  // `null`
  "NullLiteralTypeAnnotation",
  "TSNullKeyword",
  // `this`
  "ThisTypeAnnotation",
  "TSThisType",
  // `number`
  "NumberTypeAnnotation",
  "TSNumberKeyword",
  // `void`
  "VoidTypeAnnotation",
  "TSVoidKeyword",
  // `boolean`
  "BooleanTypeAnnotation",
  "TSBooleanKeyword",
  // `bigint`
  "BigIntTypeAnnotation",
  "TSBigIntKeyword",
  // `symbol`
  "SymbolTypeAnnotation",
  "TSSymbolKeyword",
  // `string`
  "StringTypeAnnotation",
  "TSStringKeyword",
  // literals
  "BooleanLiteralTypeAnnotation",
  "StringLiteralTypeAnnotation",
  "BigIntLiteralTypeAnnotation",
  "NumberLiteralTypeAnnotation",
  "TSLiteralType",
  "TSTemplateLiteralType",
  // flow only, `empty`, `mixed`
  "EmptyTypeAnnotation",
  "MixedTypeAnnotation",
  // typescript only, `never`, `object`, `undefined`, `unknown`
  "TSNeverKeyword",
  "TSObjectKeyword",
  "TSUndefinedKeyword",
  "TSUnknownKeyword",
]);
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isSimpleType(node) {
  if (!node) {
    return false;
  }

  if (
    (node.type === "GenericTypeAnnotation" ||
      node.type === "TSTypeReference") &&
    !node.typeParameters
  ) {
    return true;
  }

  if (simpleTypeAnnotations.has(node.type)) {
    return true;
  }

  return false;
}

const unitTestRe = /^(skip|[fx]?(it|describe|test))$/;

/**
 * @param {{callee: MemberExpression | OptionalMemberExpression}} node
 * @returns {boolean}
 */
function isSkipOrOnlyBlock(node) {
  return (
    isMemberExpression(node.callee) &&
    node.callee.object.type === "Identifier" &&
    node.callee.property.type === "Identifier" &&
    unitTestRe.test(node.callee.object.name) &&
    (node.callee.property.name === "only" ||
      node.callee.property.name === "skip")
  );
}

/**
 * @param {CallExpression} node
 * @returns {boolean}
 */
function isUnitTestSetUp(node) {
  const unitTestSetUpRe = /^(before|after)(Each|All)$/;
  return (
    node.callee.type === "Identifier" &&
    unitTestSetUpRe.test(node.callee.name) &&
    node.arguments.length === 1
  );
}

// eg; `describe("some string", (done) => {})`
function isTestCall(node, parent) {
  if (node.type !== "CallExpression") {
    return false;
  }
  if (node.arguments.length === 1) {
    if (isAngularTestWrapper(node) && parent && isTestCall(parent)) {
      return isFunctionOrArrowExpression(node.arguments[0]);
    }

    if (isUnitTestSetUp(node)) {
      return isAngularTestWrapper(node.arguments[0]);
    }
  } else if (node.arguments.length === 2 || node.arguments.length === 3) {
    if (
      ((node.callee.type === "Identifier" &&
        unitTestRe.test(node.callee.name)) ||
        isSkipOrOnlyBlock(node)) &&
      (isTemplateLiteral(node.arguments[0]) ||
        isStringLiteral(node.arguments[0]))
    ) {
      // it("name", () => { ... }, 2500)
      if (node.arguments[2] && !isNumericLiteral(node.arguments[2])) {
        return false;
      }
      return (
        (node.arguments.length === 2
          ? isFunctionOrArrowExpression(node.arguments[1])
          : isFunctionOrArrowExpressionWithBody(node.arguments[1]) &&
            getFunctionParameters(node.arguments[1]).length <= 1) ||
        isAngularTestWrapper(node.arguments[1])
      );
    }
  }
  return false;
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isCallExpression(node) {
  return (
    node &&
    (node.type === "CallExpression" || node.type === "OptionalCallExpression")
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMemberExpression(node) {
  return (
    node &&
    (node.type === "MemberExpression" ||
      node.type === "OptionalMemberExpression")
  );
}

/**
 *
 * @param {any} node
 * @returns {boolean}
 */
function isSimpleTemplateLiteral(node) {
  let expressionsKey = "expressions";
  if (node.type === "TSTemplateLiteralType") {
    expressionsKey = "types";
  }
  const expressions = node[expressionsKey];

  if (expressions.length === 0) {
    return false;
  }

  return expressions.every((expr) => {
    // Disallow comments since printDocToString can't print them here
    if (hasComment(expr)) {
      return false;
    }

    // Allow `x` and `this`
    if (expr.type === "Identifier" || expr.type === "ThisExpression") {
      return true;
    }

    // Allow `a.b.c`, `a.b[c]`, and `this.x.y`
    if (isMemberExpression(expr)) {
      let head = expr;
      while (isMemberExpression(head)) {
        if (
          head.property.type !== "Identifier" &&
          head.property.type !== "Literal" &&
          head.property.type !== "StringLiteral" &&
          head.property.type !== "NumericLiteral"
        ) {
          return false;
        }
        head = head.object;
        if (hasComment(head)) {
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

/**
 * @param {string} tokenNode
 * @param {string} keyword
 * @returns {string}
 */
function getTypeScriptMappedTypeModifier(tokenNode, keyword) {
  if (tokenNode === "+") {
    return "+" + keyword;
  }

  if (tokenNode === "-") {
    return "-" + keyword;
  }

  return keyword;
}

/**
 * @param {string} text
 * @param {Node} typeAnnotation
 * @returns {boolean}
 */
function isFlowAnnotationComment(text, typeAnnotation) {
  const start = locStart(typeAnnotation);
  const end = skipWhitespace(text, locEnd(typeAnnotation));
  return (
    end !== false &&
    text.slice(start, start + 2) === "/*" &&
    text.slice(end, end + 2) === "*/"
  );
}

/**
 * @param {string} text
 * @param {Node} node
 * @returns {boolean}
 */
function hasLeadingOwnLineComment(text, node) {
  if (isJsxNode(node)) {
    return hasNodeIgnoreComment(node);
  }

  return hasComment(node, CommentCheckFlags.Leading, (comment) =>
    hasNewline(text, locEnd(comment))
  );
}

// Note: Quoting/unquoting numbers in TypeScript is not safe.
//
// let a = { 1: 1, 2: 2 }
// let b = { '1': 1, '2': 2 }
//
// declare let aa: keyof typeof a;
// declare let bb: keyof typeof b;
//
// aa = bb;
// ^^
// Type '"1" | "2"' is not assignable to type '1 | 2'.
//   Type '"1"' is not assignable to type '1 | 2'.(2322)
//
// And in Flow, you get:
//
// const x = {
//   0: 1
//   ^ Non-string literal property keys not supported. [unsupported-syntax]
// }
//
// Angular does not support unquoted numbers in expressions.
//
// So we play it safe and only unquote numbers for the JavaScript parsers.
// (Vue supports unquoted numbers in expressions, but let’s keep it simple.)
//
// Identifiers can be unquoted in more circumstances, though.
function isStringPropSafeToUnquote(node, options) {
  return (
    options.parser !== "json" &&
    isStringLiteral(node.key) &&
    rawText(node.key).slice(1, -1) === node.key.value &&
    ((isIdentifierName(node.key.value) &&
      // With `--strictPropertyInitialization`, TS treats properties with quoted names differently than unquoted ones.
      // See https://github.com/microsoft/TypeScript/pull/20075
      !(
        (options.parser === "typescript" || options.parser === "babel-ts") &&
        node.type === "ClassProperty"
      )) ||
      (isSimpleNumber(node.key.value) &&
        String(Number(node.key.value)) === node.key.value &&
        (options.parser === "babel" ||
          options.parser === "espree" ||
          options.parser === "meriyah" ||
          options.parser === "__babel_estree")))
  );
}

// Matches “simple” numbers like `123` and `2.5` but not `1_000`, `1e+100` or `0b10`.
function isSimpleNumber(numberString) {
  return /^(\d+|\d+\.\d+)$/.test(numberString);
}

/**
 * @param {Node} node
 * @param {Node} parentNode
 * @returns {boolean}
 */
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

/**
 * @param {TemplateLiteral} template
 * @returns {boolean}
 */
function templateLiteralHasNewLines(template) {
  return template.quasis.some((quasi) => quasi.value.raw.includes("\n"));
}

/**
 * @param {TemplateLiteral | TaggedTemplateExpression} node
 * @param {string} text
 * @returns {boolean}
 */
function isTemplateOnItsOwnLine(node, text) {
  return (
    ((node.type === "TemplateLiteral" && templateLiteralHasNewLines(node)) ||
      (node.type === "TaggedTemplateExpression" &&
        templateLiteralHasNewLines(node.quasi))) &&
    !hasNewline(text, locStart(node), { backwards: true })
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function needsHardlineAfterDanglingComment(node) {
  if (!hasComment(node)) {
    return false;
  }
  const lastDanglingComment = getLast(
    getComments(node, CommentCheckFlags.Dangling)
  );
  return lastDanglingComment && !isBlockComment(lastDanglingComment);
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
    } else if (isCallExpression(arg)) {
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
/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isLongCurriedCallExpression(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  return (
    isCallExpression(node) &&
    isCallExpression(parent) &&
    parent.callee === node &&
    node.arguments.length > parent.arguments.length &&
    parent.arguments.length > 0
  );
}

/**
 * @param {any} node
 * @param {number} depth
 * @returns {boolean}
 */
function isSimpleCallArgument(node, depth) {
  if (depth >= 2) {
    return false;
  }

  const isChildSimple = (child) => isSimpleCallArgument(child, depth + 1);

  const regexpPattern =
    (node.type === "Literal" && "regex" in node && node.regex.pattern) ||
    (node.type === "RegExpLiteral" && node.pattern);

  if (regexpPattern && regexpPattern.length > 5) {
    return false;
  }

  if (
    node.type === "Literal" ||
    node.type === "BigIntLiteral" ||
    node.type === "DecimalLiteral" ||
    node.type === "BooleanLiteral" ||
    node.type === "NullLiteral" ||
    node.type === "NumericLiteral" ||
    node.type === "RegExpLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "Identifier" ||
    node.type === "ThisExpression" ||
    node.type === "Super" ||
    node.type === "PrivateName" ||
    node.type === "PrivateIdentifier" ||
    node.type === "ArgumentPlaceholder" ||
    node.type === "Import"
  ) {
    return true;
  }

  if (node.type === "TemplateLiteral") {
    return (
      node.quasis.every((element) => !element.value.raw.includes("\n")) &&
      node.expressions.every(isChildSimple)
    );
  }

  if (node.type === "ObjectExpression") {
    return node.properties.every(
      (p) => !p.computed && (p.shorthand || (p.value && isChildSimple(p.value)))
    );
  }

  if (node.type === "ArrayExpression") {
    return node.elements.every((x) => x === null || isChildSimple(x));
  }

  if (isCallLikeExpression(node)) {
    return (
      (node.type === "ImportExpression" ||
        isSimpleCallArgument(node.callee, depth)) &&
      getCallArguments(node).every(isChildSimple)
    );
  }

  if (isMemberExpression(node)) {
    return (
      isSimpleCallArgument(node.object, depth) &&
      isSimpleCallArgument(node.property, depth)
    );
  }

  if (
    node.type === "UnaryExpression" &&
    (node.operator === "!" || node.operator === "-")
  ) {
    return isSimpleCallArgument(node.argument, depth);
  }

  if (node.type === "TSNonNullExpression") {
    return isSimpleCallArgument(node.expression, depth);
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

/**
 * @param {any} options
 * @param {("es5" | "all")} [level]
 * @returns {boolean}
 */
function shouldPrintComma(options, level = "es5") {
  return (
    (options.trailingComma === "es5" && level === "es5") ||
    (options.trailingComma === "all" && (level === "all" || level === "es5"))
  );
}

/**
 * Tests if an expression starts with `{`, or (if forbidFunctionClassAndDoExpr
 * holds) `function`, `class`, or `do {}`. Will be overzealous if there's
 * already necessary grouping parentheses.
 *
 * @param {Node} node
 * @param {boolean} forbidFunctionClassAndDoExpr
 * @returns {boolean}
 */
function startsWithNoLookaheadToken(node, forbidFunctionClassAndDoExpr) {
  node = getLeftMost(node);
  switch (node.type) {
    case "FunctionExpression":
    case "ClassExpression":
    case "DoExpression":
      return forbidFunctionClassAndDoExpr;
    case "ObjectExpression":
      return true;
    case "MemberExpression":
    case "OptionalMemberExpression":
      return startsWithNoLookaheadToken(
        node.object,
        forbidFunctionClassAndDoExpr
      );
    case "TaggedTemplateExpression":
      if (node.tag.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.tag, forbidFunctionClassAndDoExpr);
    case "CallExpression":
    case "OptionalCallExpression":
      if (node.callee.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(
        node.callee,
        forbidFunctionClassAndDoExpr
      );
    case "ConditionalExpression":
      return startsWithNoLookaheadToken(
        node.test,
        forbidFunctionClassAndDoExpr
      );
    case "UpdateExpression":
      return (
        !node.prefix &&
        startsWithNoLookaheadToken(node.argument, forbidFunctionClassAndDoExpr)
      );
    case "BindExpression":
      return (
        node.object &&
        startsWithNoLookaheadToken(node.object, forbidFunctionClassAndDoExpr)
      );
    case "SequenceExpression":
      return startsWithNoLookaheadToken(
        node.expressions[0],
        forbidFunctionClassAndDoExpr
      );
    case "TSAsExpression":
    case "TSNonNullExpression":
      return startsWithNoLookaheadToken(
        node.expression,
        forbidFunctionClassAndDoExpr
      );
    default:
      return false;
  }
}

const equalityOperators = {
  "==": true,
  "!=": true,
  "===": true,
  "!==": true,
};
const multiplicativeOperators = {
  "*": true,
  "/": true,
  "%": true,
};
const bitshiftOperators = {
  ">>": true,
  ">>>": true,
  "<<": true,
};

function shouldFlatten(parentOp, nodeOp) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    return false;
  }

  // ** is right-associative
  // x ** y ** z --> x ** (y ** z)
  if (parentOp === "**") {
    return false;
  }

  // x == y == z --> (x == y) == z
  if (equalityOperators[parentOp] && equalityOperators[nodeOp]) {
    return false;
  }

  // x * y % z --> (x * y) % z
  if (
    (nodeOp === "%" && multiplicativeOperators[parentOp]) ||
    (parentOp === "%" && multiplicativeOperators[nodeOp])
  ) {
    return false;
  }

  // x * y / z --> (x * y) / z
  // x / y * z --> (x / y) * z
  if (
    nodeOp !== parentOp &&
    multiplicativeOperators[nodeOp] &&
    multiplicativeOperators[parentOp]
  ) {
    return false;
  }

  // x << y << z --> (x << y) << z
  if (bitshiftOperators[parentOp] && bitshiftOperators[nodeOp]) {
    return false;
  }

  return true;
}

const PRECEDENCE = {};
for (const [i, tier] of [
  ["|>"],
  ["??"],
  ["||"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "===", "!=", "!=="],
  ["<", ">", "<=", ">=", "in", "instanceof"],
  [">>", "<<", ">>>"],
  ["+", "-"],
  ["*", "/", "%"],
  ["**"],
].entries()) {
  for (const op of tier) {
    PRECEDENCE[op] = i;
  }
}

function getPrecedence(op) {
  return PRECEDENCE[op];
}

function getLeftMost(node) {
  while (node.left) {
    node = node.left;
  }
  return node;
}

function isBitwiseOperator(operator) {
  return (
    Boolean(bitshiftOperators[operator]) ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
}

function hasRestParameter(node) {
  if (node.rest) {
    return true;
  }
  const parameters = getFunctionParameters(node);
  return parameters.length > 0 && getLast(parameters).type === "RestElement";
}

const functionParametersCache = new WeakMap();
function getFunctionParameters(node) {
  if (functionParametersCache.has(node)) {
    return functionParametersCache.get(node);
  }
  const parameters = [];
  if (node.this) {
    parameters.push(node.this);
  }
  // `params` vs `parameters` - see https://github.com/babel/babel/issues/9231
  if (Array.isArray(node.parameters)) {
    parameters.push(...node.parameters);
  } else if (Array.isArray(node.params)) {
    parameters.push(...node.params);
  }
  if (node.rest) {
    parameters.push(node.rest);
  }
  functionParametersCache.set(node, parameters);
  return parameters;
}

function iterateFunctionParametersPath(path, iteratee) {
  const node = path.getValue();
  let index = 0;
  const callback = (childPath) => iteratee(childPath, index++);
  if (node.this) {
    path.call(callback, "this");
  }
  if (Array.isArray(node.parameters)) {
    path.each(callback, "parameters");
  } else if (Array.isArray(node.params)) {
    path.each(callback, "params");
  }
  if (node.rest) {
    path.call(callback, "rest");
  }
}

const callArgumentsCache = new WeakMap();
function getCallArguments(node) {
  if (callArgumentsCache.has(node)) {
    return callArgumentsCache.get(node);
  }

  let args = node.arguments;
  if (node.type === "ImportExpression") {
    args = [node.source];

    if (node.attributes) {
      args.push(node.attributes);
    }
  }

  callArgumentsCache.set(node, args);
  return args;
}

function iterateCallArgumentsPath(path, iteratee) {
  const node = path.getValue();
  if (node.type === "ImportExpression") {
    path.call((sourcePath) => iteratee(sourcePath, 0), "source");

    if (node.attributes) {
      path.call((sourcePath) => iteratee(sourcePath, 1), "attributes");
    }
  } else {
    path.each(iteratee, "arguments");
  }
}

function isPrettierIgnoreComment(comment) {
  return comment.value.trim() === "prettier-ignore" && !comment.unignore;
}

function hasNodeIgnoreComment(node) {
  return (
    node &&
    (node.prettierIgnore || hasComment(node, CommentCheckFlags.PrettierIgnore))
  );
}

function hasIgnoreComment(path) {
  const node = path.getValue();
  return hasNodeIgnoreComment(node);
}

const CommentCheckFlags = {
  /** Check comment is a leading comment */
  Leading: 1 << 1,
  /** Check comment is a trailing comment */
  Trailing: 1 << 2,
  /** Check comment is a dangling comment */
  Dangling: 1 << 3,
  /** Check comment is a block comment */
  Block: 1 << 4,
  /** Check comment is a line comment */
  Line: 1 << 5,
  /** Check comment is a `prettier-ignore` comment */
  PrettierIgnore: 1 << 6,
  /** Check comment is the first attached comment */
  First: 1 << 7,
  /** Check comment is the last attached comment */
  Last: 1 << 8,
};

const getCommentTestFunction = (flags, fn) => {
  if (typeof flags === "function") {
    fn = flags;
    flags = 0;
  }
  if (flags || fn) {
    return (comment, index, comments) =>
      !(
        (flags & CommentCheckFlags.Leading && !comment.leading) ||
        (flags & CommentCheckFlags.Trailing && !comment.trailing) ||
        (flags & CommentCheckFlags.Dangling &&
          (comment.leading || comment.trailing)) ||
        (flags & CommentCheckFlags.Block && !isBlockComment(comment)) ||
        (flags & CommentCheckFlags.Line && !isLineComment(comment)) ||
        (flags & CommentCheckFlags.First && index !== 0) ||
        (flags & CommentCheckFlags.Last && index !== comments.length - 1) ||
        (flags & CommentCheckFlags.PrettierIgnore &&
          !isPrettierIgnoreComment(comment)) ||
        (fn && !fn(comment))
      );
  }
};
/**
 * @param {Node} node
 * @param {number | function} [flags]
 * @param {function} [fn]
 * @returns {boolean}
 */
function hasComment(node, flags, fn) {
  if (!node || !isNonEmptyArray(node.comments)) {
    return false;
  }
  const test = getCommentTestFunction(flags, fn);
  return test ? node.comments.some(test) : true;
}

/**
 * @param {Node} node
 * @param {number | function} [flags]
 * @param {function} [fn]
 * @returns {Comment[]}
 */
function getComments(node, flags, fn) {
  if (!node || !Array.isArray(node.comments)) {
    return [];
  }
  const test = getCommentTestFunction(flags, fn);
  return test ? node.comments.filter(test) : node.comments;
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
const isNextLineEmpty = (node, { originalText }) =>
  isNextLineEmptyAfterIndex(originalText, locEnd(node));

function isCallLikeExpression(node) {
  return (
    isCallExpression(node) ||
    node.type === "NewExpression" ||
    node.type === "ImportExpression"
  );
}

function isObjectProperty(node) {
  return (
    node &&
    (node.type === "ObjectProperty" ||
      (node.type === "Property" && !node.method && node.kind === "init"))
  );
}

const danglingCommentMarkerForReadonlyMappedType =
  "danglingCommentMarkerForReadonlyMappedType";

module.exports = {
  getFunctionParameters,
  iterateFunctionParametersPath,
  getCallArguments,
  iterateCallArgumentsPath,
  hasRestParameter,
  getLeftSide,
  getLeftSidePathName,
  getParentExportDeclaration,
  getTypeScriptMappedTypeModifier,
  hasFlowAnnotationComment,
  hasFlowShorthandAnnotationComment,
  hasLeadingOwnLineComment,
  hasNakedLeftSide,
  hasNode,
  hasIgnoreComment,
  hasNodeIgnoreComment,
  identity,
  isBinaryish,
  isBlockComment,
  isCallLikeExpression,
  isLineComment,
  isPrettierIgnoreComment,
  isCallExpression,
  isMemberExpression,
  isExportDeclaration,
  isFlowAnnotationComment,
  isFunctionCompositionArgs,
  isFunctionNotation,
  isFunctionOrArrowExpression,
  isGetterOrSetter,
  isJestEachTemplateLiteral,
  isJsxNode,
  isLiteral,
  isLongCurriedCallExpression,
  isSimpleCallArgument,
  isMemberish,
  isNumericLiteral,
  isSignedNumericLiteral,
  isObjectProperty,
  isObjectType,
  isObjectTypePropertyAFunction,
  isSimpleType,
  isSimpleNumber,
  isSimpleTemplateLiteral,
  isStringLiteral,
  isStringPropSafeToUnquote,
  isTemplateOnItsOwnLine,
  isTestCall,
  isTheOnlyJsxElementInMarkdown,
  isTSXFile,
  isTypeAnnotationAFunction,
  isNextLineEmpty,
  needsHardlineAfterDanglingComment,
  rawText,
  shouldPrintComma,
  isBitwiseOperator,
  shouldFlatten,
  startsWithNoLookaheadToken,
  getPrecedence,
  hasComment,
  getComments,
  CommentCheckFlags,
  danglingCommentMarkerForReadonlyMappedType,
};
