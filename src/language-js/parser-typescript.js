"use strict";

const createError = require("../common/parser-create-error");
const includeShebang = require("../common/parser-include-shebang");
const { hasPragma } = require("./pragma");
const locFns = require("./loc");
const postprocess = require("./postprocess");

function parse(text, parsers, opts) {
  const jsx = isProbablyJsx(text);
  let ast;
  try {
    // Try passing with our best guess first.
    ast = tryParseTypeScript(text, jsx);
  } catch (firstError) {
    try {
      // But if we get it wrong, try the opposite.
      ast = tryParseTypeScript(text, !jsx);
    } catch (secondError) {
      // suppose our guess is correct
      const e = firstError;

      if (typeof e.lineNumber === "undefined") {
        throw e;
      }

      throw createError(e.message, {
        start: { line: e.lineNumber, column: e.column + 1 },
      });
    }
  }

  includeShebang(text, ast);
  return postprocess(ast, { ...opts, originalText: text });
}

function tryParseTypeScript(text, jsx) {
  const parser = require("@typescript-eslint/typescript-estree");
  return parser.parse(text, {
    loc: true,
    range: true,
    comment: true,
    useJSXTextNode: true,
    jsx,
  });
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

const parser = { parse, astFormat: "estree", hasPragma, ...locFns };

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    typescript: parser,
  },
};
