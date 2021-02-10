"use strict";

const raw = require("jest-snapshot-serializer-raw").wrap;
const visualizeRange = require("./visualize-range");
const visualizeEndOfLine = require("./visualize-end-of-line");

const SEPARATOR_WIDTH = 80;
function printSeparator(description = "") {
  const leftLength = Math.floor((SEPARATOR_WIDTH - description.length) / 2);
  const rightLength = SEPARATOR_WIDTH - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function stringify(value) {
  return value === Number.POSITIVE_INFINITY
    ? "Infinity"
    : Array.isArray(value)
    ? `[${value.map((v) => JSON.stringify(v)).join(", ")}]`
    : JSON.stringify(value);
}

function printOptions(options) {
  const {
    plugins,
    filepath,
    errors,
    parser,

    ...snapshotOptions
  } = options;

  const keys = Object.keys(snapshotOptions).sort();
  return keys
    .map((key) => `${key}: ${stringify(snapshotOptions[key])}`)
    .join("\n");
}

function printWidthIndicator(printWidth, offset) {
  if (!Number.isFinite(printWidth) || printWidth < 1) {
    return "";
  }

  let before = "";
  if (offset) {
    before = " ".repeat(offset - 1) + "|";
  }

  let text = "printWidth";
  if (printWidth >= text.length + 2) {
    text = `${" ".repeat(printWidth - text.length - 2)} ${text} |`;
  } else {
    text = `${" ".repeat(printWidth)}| ${text}`;
  }

  return `${before}${text}`;
}

function createSnapshot(
  formatResult,
  { parsers, formatOptions, CURSOR_PLACEHOLDER }
) {
  let {
    inputWithCursor: input,
    outputWithCursor: output,
    options,
  } = formatResult;
  let { rangeStart, rangeEnd, cursorOffset, printWidth } = options;

  let codeOffset = 0;
  if (typeof rangeStart === "number" || typeof rangeEnd === "number") {
    if (typeof cursorOffset === "number") {
      if (typeof rangeStart === "number" && rangeStart > cursorOffset) {
        rangeStart += CURSOR_PLACEHOLDER.length;
      }
      if (typeof rangeEnd === "number" && rangeEnd > cursorOffset) {
        rangeEnd += CURSOR_PLACEHOLDER.length;
      }
    }

    input = visualizeRange(input, { rangeStart, rangeEnd });
    codeOffset = input.match(/^>?\s+1 \|/)[0].length + 1;
  }

  if ("endOfLine" in formatOptions) {
    input = visualizeEndOfLine(input);
    output = visualizeEndOfLine(output);
  }

  const widthIndicator = printWidthIndicator(printWidth, codeOffset);

  return raw(
    [
      printSeparator("options"),
      printOptions({ ...options, parsers }),
      ...(widthIndicator ? [widthIndicator] : []),
      printSeparator("input"),
      input,
      printSeparator("output"),
      output,
      printSeparator(),
    ].join("\n")
  );
}

module.exports = createSnapshot;
