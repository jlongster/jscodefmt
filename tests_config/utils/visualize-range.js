"use strict";

const LinesAndColumns = require("lines-and-columns").default;
const { codeFrameColumns } = require("@babel/code-frame");
const codeFrameColumnsOptions = { linesAbove: Infinity, linesBelow: Infinity };

const locationForRange = (text, rangeStart, rangeEnd) => {
  const lines = new LinesAndColumns(text);
  const start = lines.locationForIndex(rangeStart);
  const end = lines.locationForIndex(rangeEnd);

  start.line += 1;
  start.column += 1;
  end.line += 1;
  if (start.line === end.line) {
    end.column += 1;
  }

  return {
    start,
    end,
  };
};

const visualizeRange = (text, { rangeStart = 0, rangeEnd = text.length }) =>
  codeFrameColumns(
    text,
    locationForRange(text, rangeStart, rangeEnd),
    codeFrameColumnsOptions
  );

module.exports = visualizeRange;
