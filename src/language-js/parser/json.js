"use strict";

const { isNonEmptyArray } = require("../../common/util");
const createError = require("../../common/parser-create-error");
const createParser = require("./create-parser");
const createBabelParseError = require("./create-babel-parse-error");

function createJsonParse(options = {}) {
  const { allowComments = true } = options;

  return function parse(text /*, parsers, options*/) {
    // @ts-ignore
    const { parseExpression, tokTypes } = require("@babel/parser");
    let ast;
    try {
      ast = parseExpression(text, { tokens: true, ranges: true });
    } catch (error) {
      throw createBabelParseError(error);
    }

    // @ts-ignore
    for (const token of ast.tokens) {
      if (token.type === tokTypes.parenL) {
        throw createJsonError(token, { message: "Unexpected token '('." });
      }
    }

    // @ts-ignore
    if (!allowComments && isNonEmptyArray(ast.comments)) {
      // @ts-ignore
      throw createJsonError(ast.comments[0], "Comment");
    }

    assertJsonNode(ast);

    return ast;
  };
}

function createJsonError(nodeOrToken, description) {
  const message =
    typeof description === "string"
      ? `${description} is not allowed in JSON.`
      : description.message;
  const [start, end] = [nodeOrToken.loc.start, nodeOrToken.loc.end].map(
    ({ line, column }) => ({
      line,
      column: column + 1,
    })
  );
  return createError(message, { start, end });
}

function assertJsonNode(node) {
  switch (node.type) {
    case "ArrayExpression":
      for (const element of node.elements) {
        if (element !== null) {
          assertJsonNode(element);
        }
      }

      return;
    case "ObjectExpression":
      for (const property of node.properties) {
        assertJsonNode(property);
      }

      return;
    case "ObjectProperty":
      if (node.computed) {
        throw createJsonError(node.key, "Computed key");
      }

      if (node.shorthand) {
        throw createJsonError(node.key, "Shorthand property");
      }

      if (node.key.type !== "Identifier") {
        assertJsonNode(node.key);
      }

      assertJsonNode(node.value);

      return;
    case "UnaryExpression": {
      const { operator, argument } = node;
      if (operator !== "+" && operator !== "-") {
        throw createJsonError(node, `Operator '${node.operator}'`);
      }

      if (
        argument.type === "NumericLiteral" ||
        (argument.type === "Identifier" &&
          (argument.name === "Infinity" || argument.name === "NaN"))
      ) {
        return;
      }

      throw createJsonError(
        argument,
        `Operator '${operator}' before '${argument.type}'`
      );
    }
    case "Identifier":
      if (
        // JSON5 https://spec.json5.org/#numbers
        node.name !== "Infinity" &&
        node.name !== "NaN" &&
        // JSON6 https://github.com/d3x0r/JSON6
        node.name !== "undefined"
      ) {
        throw createJsonError(node, `Identifier '${node.name}'`);
      }

      return;
    case "TemplateLiteral":
      if (isNonEmptyArray(node.expressions)) {
        throw createJsonError(
          node.expressions[0],
          "'TemplateLiteral' with expression"
        );
      }

      for (const element of node.quasis) {
        assertJsonNode(element);
      }

      return;
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
    case "TemplateElement":
      return;
    default:
      throw createJsonError(node, `'${node.type}'`);
  }
}

const parseJson = createJsonParse();

const jsonParsers = {
  json: createParser({
    parse: parseJson,
    hasPragma() {
      return true;
    },
  }),
  json5: createParser(parseJson),
  "json-stringify": createParser({
    parse: createJsonParse({ allowComments: false }),
    astFormat: "estree-json",
  }),
};

module.exports = jsonParsers;
