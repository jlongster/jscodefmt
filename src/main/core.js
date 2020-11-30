"use strict";

const diff = require("diff");

const {
  printer: { printDocToString },
  debug: { printDocToDebug },
} = require("../document");
const { getAlignmentSize } = require("../common/util");
const {
  guessEndOfLine,
  convertEndOfLineToChars,
  countEndOfLineChars,
  normalizeEndOfLine,
} = require("../common/end-of-line");
const normalizeOptions = require("./options").normalize;
const massageAST = require("./massage-ast");
const comments = require("./comments");
const parser = require("./parser");
const printAstToDoc = require("./ast-to-doc");
const rangeUtil = require("./range-util");

const BOM = "\uFEFF";

const CURSOR = Symbol("cursor");

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  opts[Symbol.for("comments")] = astComments || [];
  opts[Symbol.for("tokens")] = ast.tokens || [];
  opts.originalText = text;
  return astComments;
}

function coreFormat(originalText, opts, addAlignmentSize) {
  if (!originalText || !originalText.trim().length) {
    return { formatted: "", cursorOffset: -1 };
  }

  addAlignmentSize = addAlignmentSize || 0;

  const { ast, text } = parser.parse(originalText, opts);

  if (opts.cursorOffset >= 0) {
    const nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);
    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);

  const result = printDocToString(doc, opts);

  comments.ensureAllCommentsPrinted(astComments);
  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    const trimmed = result.formatted.trim();

    if (result.cursorNodeStart !== undefined) {
      result.cursorNodeStart -= result.formatted.indexOf(trimmed);
    }

    result.formatted = trimmed + convertEndOfLineToChars(opts.endOfLine);
  }

  if (opts.cursorOffset >= 0) {
    let oldCursorNodeStart;
    let oldCursorNodeText;

    let cursorOffsetRelativeToOldCursorNode;

    let newCursorNodeStart;
    let newCursorNodeText;

    if (opts.cursorNode && result.cursorNodeText) {
      oldCursorNodeStart = opts.locStart(opts.cursorNode);
      oldCursorNodeText = text.slice(
        oldCursorNodeStart,
        opts.locEnd(opts.cursorNode)
      );

      cursorOffsetRelativeToOldCursorNode =
        opts.cursorOffset - oldCursorNodeStart;

      newCursorNodeStart = result.cursorNodeStart;
      newCursorNodeText = result.cursorNodeText;
    } else {
      oldCursorNodeStart = 0;
      oldCursorNodeText = text;

      cursorOffsetRelativeToOldCursorNode = opts.cursorOffset;

      newCursorNodeStart = 0;
      newCursorNodeText = result.formatted;
    }

    if (oldCursorNodeText === newCursorNodeText) {
      return {
        formatted: result.formatted,
        cursorOffset: newCursorNodeStart + cursorOffsetRelativeToOldCursorNode,
      };
    }

    // diff old and new cursor node texts, with a special cursor
    // symbol inserted to find out where it moves to

    const oldCursorNodeCharArray = oldCursorNodeText.split("");
    oldCursorNodeCharArray.splice(
      cursorOffsetRelativeToOldCursorNode,
      0,
      CURSOR
    );

    const newCursorNodeCharArray = newCursorNodeText.split("");

    const cursorNodeDiff = diff.diffArrays(
      oldCursorNodeCharArray,
      newCursorNodeCharArray
    );

    let cursorOffset = newCursorNodeStart;
    for (const entry of cursorNodeDiff) {
      if (entry.removed) {
        if (entry.value.includes(CURSOR)) {
          break;
        }
      } else {
        cursorOffset += entry.count;
      }
    }

    return { formatted: result.formatted, cursorOffset };
  }

  return { formatted: result.formatted, cursorOffset: -1 };
}

function formatRange(originalText, opts, selectedParser) {
  const { ast, text } = parser.parse(originalText, opts);
  const { rangeStart, rangeEnd } = rangeUtil.calculateRange(
    text,
    opts,
    ast,
    selectedParser
  );
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1
  );
  const indentString = text.slice(rangeStart2, rangeStart).match(/^\s*/)[0];

  const alignmentSize = getAlignmentSize(indentString, opts.tabWidth);

  const rangeResult = coreFormat(
    rangeString,
    {
      ...opts,
      rangeStart: 0,
      rangeEnd: Infinity,
      // Track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset > rangeStart && opts.cursorOffset < rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1,
      // Always use `lf` to format, we'll replace it later
      endOfLine: "lf",
    },
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimEnd();

  let { cursorOffset } = opts;
  if (cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset =
      opts.cursorOffset + (rangeTrimmed.length - rangeString.length);
  } else if (rangeResult.cursorOffset >= 0) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  }
  // keep the cursor as it was if it was before the start of the range

  let formatted =
    text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
  if (opts.endOfLine !== "lf") {
    const eol = convertEndOfLineToChars(opts.endOfLine);
    if (cursorOffset >= 0 && eol === "\r\n") {
      cursorOffset += countEndOfLineChars(
        formatted.slice(0, cursorOffset),
        "\n"
      );
    }

    formatted = formatted.replace(/\n/g, eol);
  }

  return { formatted, cursorOffset };
}

function ensureIndexInText(text, index, defaultValue) {
  if (
    typeof index !== "number" ||
    isNaN(index) ||
    index < 0 ||
    index > text.length
  ) {
    return defaultValue;
  }

  return index;
}

function normalizeIndexes(text, options) {
  let { cursorOffset, rangeStart, rangeEnd } = options;
  cursorOffset = ensureIndexInText(text, cursorOffset, -1);
  rangeStart = ensureIndexInText(text, rangeStart, 0);
  rangeEnd = ensureIndexInText(text, rangeEnd, text.length);

  return { ...options, cursorOffset, rangeStart, rangeEnd };
}

function normalizeInputAndOptions(text, options) {
  let { cursorOffset, rangeStart, rangeEnd, endOfLine } = normalizeIndexes(
    text,
    options
  );

  const hasBOM = text.charAt(0) === BOM;

  if (hasBOM) {
    text = text.slice(1);
    cursorOffset--;
    rangeStart--;
    rangeEnd--;
  }

  if (endOfLine === "auto") {
    endOfLine = guessEndOfLine(text);
  }

  // get rid of CR/CRLF parsing
  if (text.includes("\r")) {
    const countCrlfBefore = (index) =>
      countEndOfLineChars(text.slice(0, Math.max(index, 0)), "\r\n");

    cursorOffset -= countCrlfBefore(cursorOffset);
    rangeStart -= countCrlfBefore(rangeStart);
    rangeEnd -= countCrlfBefore(rangeEnd);

    text = normalizeEndOfLine(text);
  }

  return {
    hasBOM,
    text,
    options: normalizeIndexes(text, {
      ...options,
      cursorOffset,
      rangeStart,
      rangeEnd,
      endOfLine,
    }),
  };
}

function format(originalText, originalOptions) {
  let { hasBOM, text, options } = normalizeInputAndOptions(
    originalText,
    normalizeOptions(originalOptions)
  );

  const selectedParser = parser.resolveParser(options);
  const hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);
  if (options.requirePragma && !hasPragma) {
    return {
      formatted: originalText,
      cursorOffset: originalOptions.cursorOffset,
    };
  }

  let result;

  if (options.rangeStart > 0 || options.rangeEnd < text.length) {
    result = formatRange(text, options, selectedParser);
  } else {
    if (!hasPragma && options.insertPragma && options.printer.insertPragma) {
      text = options.printer.insertPragma(text);
    }
    result = coreFormat(text, options);
  }

  if (hasBOM) {
    result.formatted = BOM + result.formatted;

    if (result.cursorOffset >= 0) {
      result.cursorOffset++;
    }
  }

  return result;
}

module.exports = {
  formatWithCursor: format,
  parse(originalText, originalOptions, massage) {
    const { text, options } = normalizeInputAndOptions(
      originalText,
      normalizeOptions(originalOptions)
    );
    const parsed = parser.parse(text, options);
    if (massage) {
      parsed.ast = massageAST(parsed.ast, options);
    }
    return parsed;
  },

  formatAST(ast, options) {
    options = normalizeOptions(options);
    const doc = printAstToDoc(ast, options);
    return printDocToString(doc, options);
  },

  // Doesn't handle shebang for now
  formatDoc(doc, options) {
    return format(printDocToDebug(doc), { ...options, parser: "babel" })
      .formatted;
  },

  printToDoc(originalText, options) {
    options = normalizeOptions(options);
    const { ast, text } = parser.parse(originalText, options);
    attachComments(text, ast, options);
    return printAstToDoc(ast, options);
  },

  printDocToString(doc, options) {
    return printDocToString(doc, normalizeOptions(options));
  },
};
