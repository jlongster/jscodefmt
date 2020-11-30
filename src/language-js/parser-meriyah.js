"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./parse-postprocess");
const { isSourceElement } = require("./source-elements");

// https://github.com/meriyah/meriyah/blob/4676f60b6c149d7082bde2c9147f9ae2359c8075/src/parser.ts#L185
const parseOptions = {
  // Allow module code
  module: true,
  // Enable stage 3 support (ESNext)
  next: true,
  // Enable start and end offsets to each node
  ranges: true,
  // Enable web compatibility
  webcompat: true,
  // Enable line/column location information to each node
  loc: true,
  // Attach raw property to each literal and identifier node
  raw: true,
  // Enabled directives
  directives: true,
  // Allow return in the global scope
  globalReturn: true,
  // Enable implied strict mode
  impliedStrict: false,
  // Enable non-standard parenthesized expression node
  preserveParens: false,
  // Enable lexical binding and scope tracking
  lexical: false,
  // Adds a source attribute in every node’s loc object when the locations option is `true`
  // source: '',
  // Distinguish Identifier from IdentifierPattern
  identifierPattern: false,
  // Enable React JSX parsing
  jsx: true,
  // Allow edge cases that deviate from the spec
  specDeviation: true,
  // Creates unique key for in ObjectPattern when key value are same
  uniqueKeyInPattern: false,
};

function parseWithOptions(text, module) {
  const { parse } = require("meriyah");
  const comments = [];
  const tokens = [];

  /** @type {any} */
  const ast = parse(text, {
    ...parseOptions,
    module,
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

function parse(text, parsers, options) {
  let ast;

  try {
    ast = parseWithOptions(text /* module */, true);
  } catch (moduleError) {
    try {
      ast = parseWithOptions(text, /* module */ false);
    } catch (_) {
      // throw the error for `module` parsing
      const { message, line, column } = moduleError;

      /* istanbul ignore next */
      if (typeof line !== "number") {
        throw moduleError;
      }

      throw createError(message, { start: { line, column } });
    }
  }

  return postprocess(ast, { ...options, originalText: text });
}

module.exports = {
  parsers: {
    meriyah: {
      parse,
      astFormat: "estree",
      hasPragma,
      locStart,
      locEnd,
      isSourceElement,
    },
  },
};
