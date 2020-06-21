"use strict";

const raw = require("jest-snapshot-serializer-raw").wrap;

function printSeparator(width, description) {
  description = description || "";
  const leftLength = Math.floor((width - description.length) / 2);
  const rightLength = width - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function stringify(value) {
  return value === Infinity
    ? "Infinity"
    : Array.isArray(value)
    ? `[${value.map((v) => JSON.stringify(v)).join(", ")}]`
    : JSON.stringify(value);
}
function printOptions(options) {
  const keys = Object.keys(options).sort();
  return keys.map((key) => `${key}: ${stringify(options[key])}`).join("\n");
}

function createSnapshot(input, output, options, { codeOffset }) {
  const separatorWidth = 80;
  const printWidthIndicator =
    options.printWidth > 0 && Number.isFinite(options.printWidth)
      ? (codeOffset ? " ".repeat(codeOffset - 1) + "|" : "") +
        " ".repeat(options.printWidth) +
        "| printWidth"
      : [];
  return raw(
    []
      .concat(
        printSeparator(separatorWidth, "options"),
        printOptions(options),
        printWidthIndicator,
        printSeparator(separatorWidth, "input"),
        input,
        printSeparator(separatorWidth, "output"),
        output,
        printSeparator(separatorWidth)
      )
      .join("\n")
  );
}

module.exports = createSnapshot;
