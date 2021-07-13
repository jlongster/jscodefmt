"use strict";

const createError = require("../common/parser-create-error");
const tryCombinations = require("../utils/try-combinations");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");
const replaceHashbang = require("./parser/replace-hashbang");

/** @type {import("@typescript-eslint/typescript-estree").TSESTreeOptions} */
const parseOptions = {
  // `jest@<=26.4.2` rely on `loc`
  // https://github.com/facebook/jest/issues/10444
  loc: true,
  range: true,
  comment: true,
  useJSXTextNode: true,
  jsx: true,
  tokens: true,
  loggerFn: false,
  project: [],
};

function createParseError(error) {
  const { message, lineNumber, column } = error;

  /* istanbul ignore next */
  if (typeof lineNumber !== "number") {
    return error;
  }

  return createError(message, {
    start: { line: lineNumber, column: column + 1 },
  });
}

function parse(text, parsers, opts) {
  const textToParse = replaceHashbang(text);
  const jsx = isProbablyJsx(text);

  const { parseWithNodeMaps } = require("@typescript-eslint/typescript-estree");
  const { result, error: firstError } = tryCombinations(
    // Try passing with our best guess first.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx }),
    // But if we get it wrong, try the opposite.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx: !jsx })
  );

  if (!result) {
    // Suppose our guess is correct, throw the first error
    throw createParseError(firstError);
  }

  return postprocess(result.ast, {
    ...opts,
    originalText: text,
    tsParseResult: result,
  });
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    typescript: createParser(parse),
  },
};
