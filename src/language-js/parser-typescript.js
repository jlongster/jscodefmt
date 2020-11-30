"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./parse-postprocess");
const { isSourceElement } = require("./source-elements");

function parse(text, parsers, opts) {
  const jsx = isProbablyJsx(text);
  let result;
  try {
    // Try passing with our best guess first.
    result = tryParseTypeScript(text, jsx);
  } catch (firstError) {
    try {
      // But if we get it wrong, try the opposite.
      result = tryParseTypeScript(text, !jsx);
    } catch (secondError) {
      // Suppose our guess is correct, throw the first error
      const { message, lineNumber, column } = firstError;

      /* istanbul ignore next */
      if (typeof lineNumber !== "number") {
        throw firstError;
      }

      throw createError(message, {
        start: { line: lineNumber, column: column + 1 },
      });
    }
  }

  return postprocess(result.ast, {
    ...opts,
    originalText: text,
    tsParseResult: result,
  });
}

function tryParseTypeScript(text, jsx) {
  const { parseWithNodeMaps } = require("@typescript-eslint/typescript-estree");
  return parseWithNodeMaps(text, {
    // `jest@<=26.4.2` rely on `loc`
    // https://github.com/facebook/jest/issues/10444
    loc: true,
    range: true,
    comment: true,
    useJSXTextNode: true,
    jsx,
    tokens: true,
    loggerFn: false,
    project: [],
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

const parser = {
  parse,
  astFormat: "estree",
  hasPragma,
  locStart,
  locEnd,
  isSourceElement,
};

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    typescript: parser,
  },
};
