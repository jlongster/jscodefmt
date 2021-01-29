"use strict";

function createError(message, loc) {
  // Construct an error similar to the ones thrown by Babel.
  const error = new SyntaxError(
    `${message} (${loc.start.line}:${loc.start.column})`
  );
  // @ts-ignore - TBD (...)
  error.loc = loc;
  return error;
}

module.exports = createError;
