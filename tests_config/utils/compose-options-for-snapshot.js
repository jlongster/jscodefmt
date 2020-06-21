"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const {
    rangeStart,
    rangeEnd,
    cursorOffset,
    disableBabelTS,
    plugins,

    ...snapshotOptions
  } = baseOptions;

  return {
    ...snapshotOptions,
    parsers,
  };
}

module.exports = composeOptionsForSnapshot;
