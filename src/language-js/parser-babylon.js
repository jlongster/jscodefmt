"use strict";

// This file is currently named parser-babylon.js to maintain backwards compatibility.
// However, it should be named parser-babel.js in the next major release.

const createError = require("../common/parser-create-error");
const hasPragma = require("./pragma").hasPragma;
const locFns = require("./loc");
const postprocess = require("./postprocess");

function babelOptions(extraOptions, extraPlugins = []) {
  return Object.assign(
    {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      errorRecovery: true,
      tokens: true,
      plugins: [
        "jsx",
        "doExpressions",
        "objectRestSpread",
        "classProperties",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "dynamicImport",
        "numericSeparator",
        "importMeta",
        "optionalCatchBinding",
        "optionalChaining",
        "classPrivateProperties",
        ["pipelineOperator", { proposal: "minimal" }],
        "nullishCoalescingOperator",
        "bigInt",
        "throwExpressions",
        "logicalAssignment",
        "classPrivateMethods",
        "v8intrinsic",
        "partialApplication",
        ["decorators", { decoratorsBeforeExport: false }]
      ].concat(extraPlugins)
    },
    extraOptions
  );
}

function createParse(parseMethod, extraPlugins) {
  return (text, parsers, opts) => {
    // Inline the require to avoid loading all the JS if we don't use it
    const babel = require("@babel/parser");

    let ast;
    try {
      ast = babel[parseMethod](text, babelOptions({}, extraPlugins));
    } catch (error) {
      throw createError(
        // babel error prints (l:c) with cols that are zero indexed
        // so we need our custom error
        error.message.replace(/ \(.*\)/, ""),
        {
          start: {
            line: error.loc.line,
            column: error.loc.column + 1
          }
        }
      );
    }
    return postprocess(ast, Object.assign({}, opts, { originalText: text }));
  };
}

const parse = createParse("parse", ["flow"]);
const parseFlow = createParse("parse", [["flow", { all: true, enums: true }]]);
const parseExpression = createParse("parseExpression");

function parseJson(text, parsers, opts) {
  const ast = parseExpression(text, parsers, opts);

  ast.comments.forEach(assertJsonNode);
  assertJsonNode(ast);

  return ast;
}

function assertJsonNode(node, parent) {
  switch (node.type) {
    case "ArrayExpression":
      return node.elements.forEach(assertJsonChildNode);
    case "ObjectExpression":
      return node.properties.forEach(assertJsonChildNode);
    case "ObjectProperty":
      // istanbul ignore if
      if (node.computed) {
        throw createJsonError("computed");
      }
      // istanbul ignore if
      if (node.shorthand) {
        throw createJsonError("shorthand");
      }
      return [node.key, node.value].forEach(assertJsonChildNode);
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return assertJsonChildNode(node.argument);
        // istanbul ignore next
        default:
          throw createJsonError("operator");
      }
    case "Identifier":
      if (parent && parent.type === "ObjectProperty" && parent.key === node) {
        return;
      }
      throw createJsonError();
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
      return;
    // istanbul ignore next
    default:
      throw createJsonError();
  }

  function assertJsonChildNode(child) {
    return assertJsonNode(child, node);
  }

  // istanbul ignore next
  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1
      }
    });
  }
}

const babel = Object.assign({ parse, astFormat: "estree", hasPragma }, locFns);
const babelFlow = Object.assign({}, babel, { parse: parseFlow });
const babelExpression = Object.assign({}, babel, { parse: parseExpression });

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    babel,
    "babel-flow": babelFlow,
    // aliased to keep backwards compatibility
    babylon: babel,
    json: Object.assign({}, babelExpression, {
      hasPragma() {
        return true;
      }
    }),
    json5: babelExpression,
    "json-stringify": Object.assign(
      {
        parse: parseJson,
        astFormat: "estree-json"
      },
      locFns
    ),
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel
  }
};
