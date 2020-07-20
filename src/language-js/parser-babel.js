"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./postprocess");
const { generateCombinations, babelPlugins } = require("./babel-plugins");

function babelOptions(options) {
  return {
    sourceType: "module",
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    errorRecovery: true,
    createParenthesizedExpressions: true,
    ...options,
  };
}

function createParse(parseMethod, parserPluginCombinations) {
  return (text, parsers, opts = {}) => {
    // Inline the require to avoid loading all the JS if we don't use it
    const babel = require("@babel/parser");
    const parse = babel[parseMethod];

    const sourceType =
      opts.__babelSourceType === "script" ? "script" : "module";

    const combinations = generateCombinations(
      text,
      parserPluginCombinations(text)
    );

    if (opts.__testBabelPluginCombinations) {
      return [...combinations];
    }

    let ast;
    try {
      ast = tryCombinations(
        (plugins) => parse(text, babelOptions({ sourceType, plugins })),
        combinations
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

const parse = createParse("parse", function* (text) {
  const plugins = [];
  const jsxPlugin = babelPlugins.jsx;

  if (jsxPlugin.test(text)) {
    plugins.push(jsxPlugin);
  }

  if (!text.includes("@flow")) {
    yield plugins;
  }

  yield [...plugins, babelPlugins.flow];
});
const parseFlow = createParse("parse", (text) => {
  return [
    babelPlugins.jsx.test(text)
      ? [babelPlugins.jsx, babelPlugins.flowWithOptions]
      : [babelPlugins.flowWithOptions],
  ];
});
const parseTypeScript = createParse("parse", function* (text) {
  if (babelPlugins.jsx.test(text)) {
    yield [babelPlugins.jsx, babelPlugins.typescript];
  }

  yield [babelPlugins.typescript];
});
const parseExpression = createParse("parseExpression", (text) => {
  return babelPlugins.jsx.test(text) ? [[babelPlugins.jsx]] : [];
});

function tryCombinations(fn, combinations) {
  let error;
  for (const plugins of combinations) {
    try {
      return rethrowSomeRecoveredErrors(fn(plugins));
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

const babel = { parse, astFormat: "estree", hasPragma, locStart, locEnd };
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
      locStart,
      locEnd,
    },
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel,
  },
};
