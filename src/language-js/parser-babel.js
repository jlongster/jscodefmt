"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const locFns = require("./loc");
const postprocess = require("./postprocess");

function babelOptions({ sourceType, extraPlugins = [] }) {
  return {
    sourceType,
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    errorRecovery: true,
    createParenthesizedExpressions: true,
    plugins: [
      // When adding a plugin, please add a test in `tests/js/babel-plugins`,
      // To remove plugins, remove it here and run `yarn test tests/js/babel-plugins` to verify

      "doExpressions",
      "classProperties",
      "exportDefaultFrom",
      "functionBind",
      "functionSent",
      "numericSeparator",
      "classPrivateProperties",
      "throwExpressions",
      "logicalAssignment",
      "classPrivateMethods",
      "v8intrinsic",
      "partialApplication",
      ["decorators", { decoratorsBeforeExport: false }],
      "privateIn",
      ["moduleAttributes", { version: "may-2020" }],
      ["recordAndTuple", { syntaxType: "hash" }],
      ...extraPlugins,
    ],
  };
}

function resolvePluginsConflict(
  condition,
  pluginCombinations,
  conflictPlugins
) {
  if (!condition) {
    return pluginCombinations;
  }
  const combinations = [];
  for (const combination of pluginCombinations) {
    for (const plugin of conflictPlugins) {
      combinations.push([...combination, plugin]);
    }
  }
  return combinations;
}

function createParse(parseMethod, ...pluginCombinations) {
  return (text, parsers, opts) => {
    // Inline the require to avoid loading all the JS if we don't use it
    const babel = require("@babel/parser");

    const sourceType =
      opts && opts.__babelSourceType === "script" ? "script" : "module";

    let ast;
    try {
      const combinations = resolvePluginsConflict(
        text.includes("|>"),
        pluginCombinations,
        [
          ["pipelineOperator", { proposal: "smart" }],
          ["pipelineOperator", { proposal: "minimal" }],
          ["pipelineOperator", { proposal: "fsharp" }],
        ]
      );
      ast = tryCombinations(
        (options) => babel[parseMethod](text, options),
        combinations.map((extraPlugins) =>
          babelOptions({ sourceType, extraPlugins })
        )
      );
    } catch (error) {
      throw createError(
        // babel error prints (l:c) with cols that are zero indexed
        // so we need our custom error
        error.message.replace(/ \(.*\)/, ""),
        error.loc
          ? {
              start: {
                line: error.loc.line,
                column: error.loc.column + 1,
              },
            }
          : { start: { line: 0, column: 0 } }
      );
    }
    delete ast.tokens;
    return postprocess(ast, { ...opts, originalText: text });
  };
}

const parse = createParse("parse", ["jsx", "flow"]);
const parseFlow = createParse("parse", [
  "jsx",
  ["flow", { all: true, enums: true }],
]);
const parseTypeScript = createParse(
  "parse",
  ["jsx", "typescript"],
  ["typescript"]
);
const parseExpression = createParse("parseExpression", ["jsx"]);

function tryCombinations(fn, combinations) {
  let error;
  for (let i = 0; i < combinations.length; i++) {
    try {
      return rethrowSomeRecoveredErrors(fn(combinations[i]));
    } catch (_error) {
      if (!error) {
        error = _error;
      }
    }
  }
  throw error;
}

function rethrowSomeRecoveredErrors(ast) {
  if (ast.errors) {
    for (const error of ast.errors) {
      if (
        typeof error.message === "string" &&
        (error.message.startsWith(
          // UnexpectedTypeAnnotation
          // https://github.com/babel/babel/blob/2f31ecf85d85cb100fa08d4d9a09de0fe4a117e4/packages/babel-parser/src/plugins/typescript/index.js#L88
          "Did not expect a type annotation here."
        ) ||
          error.message.startsWith(
            // ModuleAttributeDifferentFromType
            // https://github.com/babel/babel/blob/bda759ac3dce548f021ca24e9182b6e6f7c218e3/packages/babel-parser/src/parser/location.js#L99
            "The only accepted module attribute is `type`"
          ))
      ) {
        throw error;
      }
    }
  }
  return ast;
}

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
      if (node.computed) {
        throw createJsonError("computed");
      }

      if (node.shorthand) {
        throw createJsonError("shorthand");
      }
      return [node.key, node.value].forEach(assertJsonChildNode);
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return assertJsonChildNode(node.argument);
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
    default:
      throw createJsonError();
  }

  function assertJsonChildNode(child) {
    return assertJsonNode(child, node);
  }

  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
      },
    });
  }
}

const babel = { parse, astFormat: "estree", hasPragma, ...locFns };
const babelFlow = { ...babel, parse: parseFlow };
const babelTypeScript = { ...babel, parse: parseTypeScript };
const babelExpression = { ...babel, parse: parseExpression };

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    babel,
    "babel-flow": babelFlow,
    "babel-ts": babelTypeScript,
    json: {
      ...babelExpression,
      hasPragma() {
        return true;
      },
    },
    json5: babelExpression,
    "json-stringify": {
      parse: parseJson,
      astFormat: "estree-json",
      ...locFns,
    },
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel,
  },
};
