"use strict";

const stringWidth = require("string-width");
const escapeStringRegexp = require("escape-string-regexp");
const getLast = require("../utils/get-last");
const { getSupportInfo } = require("../main/support");

const notAsciiRegex = /[^\x20-\x7F]/;

const getPenultimate = (arr) => arr[arr.length - 2];

/**
 * @typedef {{backwards?: boolean}} SkipOptions
 */

/**
 * @param {string | RegExp} chars
 * @returns {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
function skip(chars) {
  return (text, index, opts) => {
    const backwards = opts && opts.backwards;

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    /* istanbul ignore next */
    if (index === false) {
      return false;
    }

    const { length } = text;
    let cursor = index;
    while (cursor >= 0 && cursor < length) {
      const c = text.charAt(cursor);
      if (chars instanceof RegExp) {
        if (!chars.test(c)) {
          return cursor;
        }
      } else if (!chars.includes(c)) {
        return cursor;
      }

      backwards ? cursor-- : cursor++;
    }

    if (cursor === -1 || cursor === length) {
      // If we reached the beginning or end of the file, return the
      // out-of-bounds cursor. It's up to the caller to handle this
      // correctly. We don't want to indicate `false` though if it
      // actually skipped valid characters.
      return cursor;
    }
    return false;
  };
}

/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipWhitespace = skip(/\s/);
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipSpaces = skip(" \t");
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipToLineEnd = skip(",; \t");
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipEverythingButNewLine = skip(/[^\n\r]/);

/**
 * @param {string} text
 * @param {number | false} index
 * @returns {number | false}
 */
function skipInlineComment(text, index) {
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (let i = index + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return index;
}

/**
 * @param {string} text
 * @param {number | false} index
 * @returns {number | false}
 */
function skipTrailingComment(text, index) {
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

// This one doesn't use the above helper function because it wants to
// test \r\n in order and `skip` doesn't support ordering and we only
// want to skip one newline. It's simple to implement.
/**
 * @param {string} text
 * @param {number | false} index
 * @param {SkipOptions=} opts
 * @returns {number | false}
 */
function skipNewline(text, index, opts) {
  const backwards = opts && opts.backwards;
  if (index === false) {
    return false;
  }

  const atIndex = text.charAt(index);
  if (backwards) {
    // We already replace `\r\n` with `\n` before parsing
    /* istanbul ignore next */
    if (text.charAt(index - 1) === "\r" && atIndex === "\n") {
      return index - 2;
    }
    if (
      atIndex === "\n" ||
      atIndex === "\r" ||
      atIndex === "\u2028" ||
      atIndex === "\u2029"
    ) {
      return index - 1;
    }
  } else {
    // We already replace `\r\n` with `\n` before parsing
    /* istanbul ignore next */
    if (atIndex === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }
    if (
      atIndex === "\n" ||
      atIndex === "\r" ||
      atIndex === "\u2028" ||
      atIndex === "\u2029"
    ) {
      return index + 1;
    }
  }

  return index;
}

/**
 * @param {string} text
 * @param {number} index
 * @param {SkipOptions=} opts
 * @returns {boolean}
 */
function hasNewline(text, index, opts = {}) {
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  const idx2 = skipNewline(text, idx, opts);
  return idx !== idx2;
}

/**
 * @param {string} text
 * @param {number} start
 * @param {number} end
 * @returns {boolean}
 */
function hasNewlineInRange(text, start, end) {
  for (let i = start; i < end; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }
  return false;
}

// Note: this function doesn't ignore leading comments unlike isNextLineEmpty
/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locStart
 */
function isPreviousLineEmpty(text, node, locStart) {
  /** @type {number | false} */
  let idx = locStart(node) - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skipNewline(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  const idx2 = skipNewline(text, idx, { backwards: true });
  return idx !== idx2;
}

/**
 * @param {string} text
 * @param {number} index
 * @returns {boolean}
 */
function isNextLineEmptyAfterIndex(text, index) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let idx = index;
  while (idx !== oldIdx) {
    // We need to skip all the potential trailing inline comments
    oldIdx = idx;
    idx = skipToLineEnd(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipSpaces(text, idx);
  }
  idx = skipTrailingComment(text, idx);
  idx = skipNewline(text, idx);
  return idx !== false && hasNewline(text, idx);
}

/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locEnd
 * @returns {boolean}
 */
function isNextLineEmpty(text, node, locEnd) {
  return isNextLineEmptyAfterIndex(text, locEnd(node));
}

/**
 * @param {string} text
 * @param {number} idx
 * @returns {number | false}
 */
function getNextNonSpaceNonCommentCharacterIndexWithStartIndex(text, idx) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let nextIdx = idx;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skipSpaces(text, nextIdx);
    nextIdx = skipInlineComment(text, nextIdx);
    nextIdx = skipTrailingComment(text, nextIdx);
    nextIdx = skipNewline(text, nextIdx);
  }
  return nextIdx;
}

/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locEnd
 * @returns {number | false}
 */
function getNextNonSpaceNonCommentCharacterIndex(text, node, locEnd) {
  return getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
    text,
    locEnd(node)
  );
}

/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locEnd
 * @returns {string}
 */
function getNextNonSpaceNonCommentCharacter(text, node, locEnd) {
  return text.charAt(
    // @ts-ignore => TBD: can return false, should we define a fallback?
    getNextNonSpaceNonCommentCharacterIndex(text, node, locEnd)
  );
}

// Not using, but it's public utils
/* istanbul ignore next */
/**
 * @param {string} text
 * @param {number} index
 * @param {SkipOptions=} opts
 * @returns {boolean}
 */
function hasSpaces(text, index, opts = {}) {
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  return idx !== index;
}

/**
 * @param {string} value
 * @param {number} tabWidth
 * @param {number=} startIndex
 * @returns {number}
 */
function getAlignmentSize(value, tabWidth, startIndex = 0) {
  let size = 0;
  for (let i = startIndex; i < value.length; ++i) {
    if (value[i] === "\t") {
      // Tabs behave in a way that they are aligned to the nearest
      // multiple of tabWidth:
      // 0 -> 4, 1 -> 4, 2 -> 4, 3 -> 4
      // 4 -> 8, 5 -> 8, 6 -> 8, 7 -> 8 ...
      size = size + tabWidth - (size % tabWidth);
    } else {
      size++;
    }
  }

  return size;
}

/**
 * @param {string} value
 * @param {number} tabWidth
 * @returns {number}
 */
function getIndentSize(value, tabWidth) {
  const lastNewlineIndex = value.lastIndexOf("\n");
  if (lastNewlineIndex === -1) {
    return 0;
  }

  return getAlignmentSize(
    // All the leading whitespaces
    value.slice(lastNewlineIndex + 1).match(/^[\t ]*/)[0],
    tabWidth
  );
}

/**
 * @typedef {'"' | "'"} Quote
 */

/**
 *
 * @param {string} raw
 * @param {Quote} preferredQuote
 * @returns {Quote}
 */
function getPreferredQuote(raw, preferredQuote) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  /** @type {{ quote: '"', regex: RegExp }} */
  const double = { quote: '"', regex: /"/g };
  /** @type {{ quote: "'", regex: RegExp }} */
  const single = { quote: "'", regex: /'/g };

  const preferred = preferredQuote === "'" ? single : double;
  const alternate = preferred === single ? double : single;

  let result = preferred.quote;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  if (
    rawContent.includes(preferred.quote) ||
    rawContent.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    const numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    result =
      numPreferredQuotes > numAlternateQuotes
        ? alternate.quote
        : preferred.quote;
  }

  return result;
}

function printString(raw, options, isDirectiveLiteral) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  // Check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  const canChangeDirectiveQuotes =
    !rawContent.includes('"') && !rawContent.includes("'");

  /** @type {Quote} */
  const enclosingQuote =
    options.parser === "json"
      ? '"'
      : options.__isInHtmlAttribute
      ? "'"
      : getPreferredQuote(raw, options.singleQuote ? "'" : '"');

  // Directives are exact code unit sequences, which means that you can't
  // change the escape sequences they use.
  // See https://github.com/prettier/prettier/issues/1555
  // and https://tc39.github.io/ecma262/#directive-prologue
  if (isDirectiveLiteral) {
    if (canChangeDirectiveQuotes) {
      return enclosingQuote + rawContent + enclosingQuote;
    }
    return raw;
  }

  // It might sound unnecessary to use `makeString` even if the string already
  // is enclosed with `enclosingQuote`, but it isn't. The string could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
  return makeString(
    rawContent,
    enclosingQuote,
    !(
      options.parser === "css" ||
      options.parser === "less" ||
      options.parser === "scss" ||
      options.embeddedInHtml
    )
  );
}

/**
 * @param {string} rawContent
 * @param {Quote} enclosingQuote
 * @param {boolean=} unescapeUnnecessaryEscapes
 * @returns {string}
 */
function makeString(rawContent, enclosingQuote, unescapeUnnecessaryEscapes) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  const regex = /\\([\S\s])|(["'])/g;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawContent` with `enclosingQuote`.
  const newContent = rawContent.replace(regex, (match, escaped, quote) => {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (quote === enclosingQuote) {
      return `\\${quote}`;
    }

    if (quote) {
      return quote;
    }

    // Unescape any unnecessarily escaped character.
    // Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27
    return unescapeUnnecessaryEscapes &&
      /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/.test(escaped)
      ? escaped
      : `\\${escaped}`;
  });

  return enclosingQuote + newContent + enclosingQuote;
}

function printNumber(rawNumber) {
  return (
    rawNumber
      .toLowerCase()
      // Remove unnecessary plus and zeroes from scientific notation.
      .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3")
      // Remove unnecessary scientific notation (1e0).
      .replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1")
      // Make sure numbers always start with a digit.
      .replace(/^([+-])?\./, "$10.")
      // Remove extraneous trailing decimal zeroes.
      .replace(/(\.\d+?)0+(?=e|$)/, "$1")
      // Remove trailing dot.
      .replace(/\.(?=e|$)/, "")
  );
}

/**
 * @param {string} str
 * @param {string} target
 * @returns {number}
 */
function getMaxContinuousCount(str, target) {
  const results = str.match(
    new RegExp(`(${escapeStringRegexp(target)})+`, "g")
  );

  if (results === null) {
    return 0;
  }

  return results.reduce(
    (maxCount, result) => Math.max(maxCount, result.length / target.length),
    0
  );
}

function getMinNotPresentContinuousCount(str, target) {
  const matches = str.match(
    new RegExp(`(${escapeStringRegexp(target)})+`, "g")
  );

  if (matches === null) {
    return 0;
  }

  const countPresent = new Map();
  let max = 0;

  for (const match of matches) {
    const count = match.length / target.length;
    countPresent.set(count, true);
    if (count > max) {
      max = count;
    }
  }

  for (let i = 1; i < max; i++) {
    if (!countPresent.get(i)) {
      return i;
    }
  }

  return max + 1;
}

/**
 * @param {string} text
 * @returns {number}
 */
function getStringWidth(text) {
  if (!text) {
    return 0;
  }

  // shortcut to avoid needless string `RegExp`s, replacements, and allocations within `string-width`
  if (!notAsciiRegex.test(text)) {
    return text.length;
  }

  return stringWidth(text);
}

function addCommentHelper(node, comment) {
  const comments = node.comments || (node.comments = []);
  comments.push(comment);
  comment.printed = false;
  comment.nodeDescription = describeNodeForDebugging(node);
}

function addLeadingComment(node, comment) {
  comment.leading = true;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addDanglingComment(node, comment, marker) {
  comment.leading = false;
  comment.trailing = false;
  if (marker) {
    comment.marker = marker;
  }
  addCommentHelper(node, comment);
}

function addTrailingComment(node, comment) {
  comment.leading = false;
  comment.trailing = true;
  addCommentHelper(node, comment);
}

function replaceEndOfLineWith(text, replacement) {
  const parts = [];
  for (const part of text.split("\n")) {
    if (parts.length > 0) {
      parts.push(replacement);
    }
    parts.push(part);
  }
  return parts;
}

function inferParserByLanguage(language, options) {
  const { languages } = getSupportInfo({ plugins: options.plugins });
  const matched =
    languages.find(({ name }) => name.toLowerCase() === language) ||
    languages.find(
      ({ aliases }) => Array.isArray(aliases) && aliases.includes(language)
    ) ||
    languages.find(
      ({ extensions }) =>
        Array.isArray(extensions) && extensions.includes(`.${language}`)
    );
  return matched && matched.parsers[0];
}

function isFrontMatterNode(node) {
  return node && node.type === "front-matter";
}

function getShebang(text) {
  if (!text.startsWith("#!")) {
    return "";
  }
  const index = text.indexOf("\n");
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
}

function isNonEmptyArray(object) {
  return Array.isArray(object) && object.length > 0;
}

/**
 * @param {string} description
 * @returns {(node: any) => symbol}
 */
function createGroupIdMapper(description) {
  const groupIds = new WeakMap();
  return function (node) {
    if (!groupIds.has(node)) {
      groupIds.set(node, Symbol(description));
    }
    return groupIds.get(node);
  };
}

function describeNodeForDebugging(node) {
  const nodeType = node.type || node.kind || "(unknown type)";
  let nodeName = String(
    node.name ||
      (node.id && (typeof node.id === "object" ? node.id.name : node.id)) ||
      (node.key && (typeof node.key === "object" ? node.key.name : node.key)) ||
      (node.value &&
        (typeof node.value === "object" ? "" : String(node.value))) ||
      node.operator ||
      ""
  );
  if (nodeName.length > 20) {
    nodeName = `${nodeName.slice(0, 19)}…`;
  }
  return nodeType + (nodeName ? ` ${nodeName}` : "");
}

module.exports = {
  inferParserByLanguage,
  replaceEndOfLineWith,
  getStringWidth,
  getMaxContinuousCount,
  getMinNotPresentContinuousCount,
  getPenultimate,
  getLast,
  getNextNonSpaceNonCommentCharacterIndexWithStartIndex,
  getNextNonSpaceNonCommentCharacterIndex,
  getNextNonSpaceNonCommentCharacter,
  skip,
  skipWhitespace,
  skipSpaces,
  skipToLineEnd,
  skipEverythingButNewLine,
  skipInlineComment,
  skipTrailingComment,
  skipNewline,
  isNextLineEmptyAfterIndex,
  isNextLineEmpty,
  isPreviousLineEmpty,
  hasNewline,
  hasNewlineInRange,
  hasSpaces,
  getAlignmentSize,
  getIndentSize,
  getPreferredQuote,
  printString,
  printNumber,
  makeString,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
  isFrontMatterNode,
  getShebang,
  isNonEmptyArray,
  createGroupIdMapper,
};
