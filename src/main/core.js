"use strict";

const diff = require("diff");

const {
  printer: { printDocToString },
  debug: { printDocToDebug },
} = require("../document");
const { isNodeIgnoreComment, getAlignmentSize } = require("../common/util");
const {
  guessEndOfLine,
  convertEndOfLineToChars,
} = require("../common/end-of-line");
const normalizeOptions = require("./options").normalize;
const massageAST = require("./massage-ast");
const comments = require("./comments");
const parser = require("./parser");
const printAstToDoc = require("./ast-to-doc");
const rangeUtil = require("./range-util");

const BOM = "\uFEFF";

const CURSOR = Symbol("cursor");
const PLACEHOLDERS = {
  cursorOffset: "<<<PRETTIER_CURSOR>>>",
  rangeStart: "<<<PRETTIER_RANGE_START>>>",
  rangeEnd: "<<<PRETTIER_RANGE_END>>>",
};

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

  for (let i = 0; i < astComments.length; ++i) {
    if (isNodeIgnoreComment(astComments[i])) {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach((comment) => {
    if (!comment.printed) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!'
      );
    }
    delete comment.printed;
  });
}

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  ast.tokens = [];
  opts.originalText = opts.parser === "yaml" ? text : text.trimEnd();
  return astComments;
}

function coreFormat(text, opts, addAlignmentSize) {
  if (!text || !text.trim().length) {
    return { formatted: "", cursorOffset: 0 };
  }

  addAlignmentSize = addAlignmentSize || 0;

  const parsed = parser.parse(text, opts);
  if (parsed.then) {
    return coreFormatAsync(text, opts, addAlignmentSize);
  }
  const { ast } = parsed;
  text = parsed.text;

  if (opts.cursorOffset >= 0) {
    const nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);
    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);

  const result = printDocToString(doc, opts);

  ensureAllCommentsPrinted(astComments);
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

  return { formatted: result.formatted };
}

// [TBD]: merge with sync version
async function coreFormatAsync(text, opts, addAlignmentSize) {
  if (!text || !text.trim().length) {
    return { formatted: "", cursorOffset: 0 };
  }

  addAlignmentSize = addAlignmentSize || 0;

  const parsed = await parser.parse(text, opts);
  const { ast } = parsed;
  text = parsed.text;

  if (opts.cursorOffset >= 0) {
    const nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);
    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);

  const result = printDocToString(doc, opts);

  ensureAllCommentsPrinted(astComments);
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

  return { formatted: result.formatted };
}

function formatRange(text, opts) {
  const parsed = parser.parse(text, opts);
  if (parsed.then) {
    return formatRangeAsync(text, opts);
  }
  const { ast } = parsed;
  text = parsed.text;

  const { rangeStart, rangeEnd } = rangeUtil.calculateRange(text, opts, ast);
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
      // track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset >= rangeStart && opts.cursorOffset < rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1,
    },
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimEnd();
  const rangeLeft = text.slice(0, rangeStart);
  const rangeRight = text.slice(rangeEnd);

  let { cursorOffset } = opts;
  if (opts.cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset =
      opts.cursorOffset - rangeEnd + (rangeStart + rangeTrimmed.length);
  } else if (rangeResult.cursorOffset !== undefined) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  }
  // keep the cursor as it was if it was before the start of the range

  let formatted;
  if (opts.endOfLine === "lf") {
    formatted = rangeLeft + rangeTrimmed + rangeRight;
  } else {
    const eol = convertEndOfLineToChars(opts.endOfLine);
    if (cursorOffset >= 0) {
      const parts = [rangeLeft, rangeTrimmed, rangeRight];
      let partIndex = 0;
      let partOffset = cursorOffset;
      while (partIndex < parts.length) {
        const part = parts[partIndex];
        if (partOffset < part.length) {
          parts[partIndex] =
            parts[partIndex].slice(0, partOffset) +
            PLACEHOLDERS.cursorOffset +
            parts[partIndex].slice(partOffset);
          break;
        }
        partIndex++;
        partOffset -= part.length;
      }
      const [newRangeLeft, newRangeTrimmed, newRangeRight] = parts;
      formatted = (
        newRangeLeft.replace(/\n/g, eol) +
        newRangeTrimmed +
        newRangeRight.replace(/\n/g, eol)
      ).replace(PLACEHOLDERS.cursorOffset, (_, index) => {
        cursorOffset = index;
        return "";
      });
    } else {
      formatted =
        rangeLeft.replace(/\n/g, eol) +
        rangeTrimmed +
        rangeRight.replace(/\n/g, eol);
    }
  }

  return { formatted, cursorOffset };
}

// [TBD]: merge with sync version
async function formatRangeAsync(text, opts) {
  const parsed = await parser.parse(text, opts);
  const { ast } = parsed;
  text = parsed.text;

  const range = rangeUtil.calculateRange(text, opts, ast);
  const { rangeStart, rangeEnd } = range;
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1
  );
  const indentString = text.slice(rangeStart2, rangeStart);

  const alignmentSize = privateUtil.getAlignmentSize(
    indentString,
    opts.tabWidth
  );

  const rangeResult = await coreFormatAsync(
    rangeString,
    {
      ...opts,
      rangeStart: 0,
      rangeEnd: Infinity,
      // track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset >= rangeStart && opts.cursorOffset < rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1,
    },
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimEnd();
  const rangeLeft = text.slice(0, rangeStart);
  const rangeRight = text.slice(rangeEnd);

  let { cursorOffset } = opts;
  if (opts.cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset =
      opts.cursorOffset - rangeEnd + (rangeStart + rangeTrimmed.length);
  } else if (rangeResult.cursorOffset !== undefined) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  }
  // keep the cursor as it was if it was before the start of the range

  let formatted;
  if (opts.endOfLine === "lf") {
    formatted = rangeLeft + rangeTrimmed + rangeRight;
  } else {
    const eol = convertEndOfLineToChars(opts.endOfLine);
    if (cursorOffset >= 0) {
      const parts = [rangeLeft, rangeTrimmed, rangeRight];
      let partIndex = 0;
      let partOffset = cursorOffset;
      while (partIndex < parts.length) {
        const part = parts[partIndex];
        if (partOffset < part.length) {
          parts[partIndex] =
            parts[partIndex].slice(0, partOffset) +
            PLACEHOLDERS.cursorOffset +
            parts[partIndex].slice(partOffset);
          break;
        }
        partIndex++;
        partOffset -= part.length;
      }
      const [newRangeLeft, newRangeTrimmed, newRangeRight] = parts;
      formatted = (
        newRangeLeft.replace(/\n/g, eol) +
        newRangeTrimmed +
        newRangeRight.replace(/\n/g, eol)
      ).replace(PLACEHOLDERS.cursorOffset, (_, index) => {
        cursorOffset = index;
        return "";
      });
    } else {
      formatted =
        rangeLeft.replace(/\n/g, eol) +
        rangeTrimmed +
        rangeRight.replace(/\n/g, eol);
    }
  }

  return { formatted, cursorOffset };
}

function format(text, opts) {
  const selectedParser = parser.resolveParser(opts);
  const hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);
  if (opts.requirePragma && !hasPragma) {
    return { formatted: text };
  }

  if (opts.endOfLine === "auto") {
    opts.endOfLine = guessEndOfLine(text);
  }

  const hasCursor = opts.cursorOffset >= 0;
  const hasRangeStart = opts.rangeStart > 0;
  const hasRangeEnd = opts.rangeEnd < text.length;

  // get rid of CR/CRLF parsing
  if (text.includes("\r")) {
    const offsetKeys = [
      hasCursor && "cursorOffset",
      hasRangeStart && "rangeStart",
      hasRangeEnd && "rangeEnd",
    ]
      .filter(Boolean)
      .sort((aKey, bKey) => opts[aKey] - opts[bKey]);

    for (let i = offsetKeys.length - 1; i >= 0; i--) {
      const key = offsetKeys[i];
      text =
        text.slice(0, opts[key]) + PLACEHOLDERS[key] + text.slice(opts[key]);
    }

    text = text.replace(/\r\n?/g, "\n");

    for (let i = 0; i < offsetKeys.length; i++) {
      const key = offsetKeys[i];
      text = text.replace(PLACEHOLDERS[key], (_, index) => {
        opts[key] = index;
        return "";
      });
    }
  }

  const hasUnicodeBOM = text.charAt(0) === BOM;
  if (hasUnicodeBOM) {
    text = text.slice(1);
    if (hasCursor) {
      opts.cursorOffset++;
    }
    if (hasRangeStart) {
      opts.rangeStart++;
    }
    if (hasRangeEnd) {
      opts.rangeEnd++;
    }
  }

  if (!hasCursor) {
    opts.cursorOffset = -1;
  }
  if (opts.rangeStart < 0) {
    opts.rangeStart = 0;
  }
  if (opts.rangeEnd > text.length) {
    opts.rangeEnd = text.length;
  }

  const result =
    hasRangeStart || hasRangeEnd
      ? formatRange(text, opts)
      : coreFormat(
          opts.insertPragma && opts.printer.insertPragma && !hasPragma
            ? opts.printer.insertPragma(text)
            : text,
          opts
        );

  if (hasUnicodeBOM) {
    result.formatted = BOM + result.formatted;

    if (hasCursor) {
      result.cursorOffset++;
    }
  }

  return result;
}

module.exports = {
  formatWithCursor(text, opts) {
    opts = normalizeOptions(opts);
    return format(text, opts);
  },

  parse(text, opts, massage) {
    opts = normalizeOptions(opts);
    if (text.includes("\r")) {
      text = text.replace(/\r\n?/g, "\n");
    }
    const parsed = parser.parse(text, opts);
    if (massage) {
      parsed.ast = massageAST(parsed.ast, opts);
    }
    return parsed;
  },

  formatAST(ast, opts) {
    opts = normalizeOptions(opts);
    const doc = printAstToDoc(ast, opts);
    return printDocToString(doc, opts);
  },

  // Doesn't handle shebang for now
  formatDoc(doc, opts) {
    const debug = printDocToDebug(doc);
    opts = normalizeOptions({ ...opts, parser: "babel" });
    return format(debug, opts).formatted;
  },

  printToDoc(text, opts) {
    opts = normalizeOptions(opts);
    const parsed = parser.parse(text, opts);
    const { ast } = parsed;
    text = parsed.text;
    attachComments(text, ast, opts);
    return printAstToDoc(ast, opts);
  },

  printDocToString(doc, opts) {
    return printDocToString(doc, normalizeOptions(opts));
  },
};
