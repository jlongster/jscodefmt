"use strict";

const getLast = require("../utils/get-last");

function locStart(node, opts) {
  opts = opts || {};
  // Handle nodes with decorators. They should start at the first decorator
  if (
    !opts.ignoreDecorators &&
    node.declaration &&
    node.declaration.decorators &&
    node.declaration.decorators.length > 0
  ) {
    return locStart(node.declaration.decorators[0]);
  }
  if (!opts.ignoreDecorators && node.decorators && node.decorators.length > 0) {
    return locStart(node.decorators[0]);
  }

  if (node.__location) {
    return node.__location.startOffset;
  }
  if (node.range) {
    return node.range[0];
  }
  if (typeof node.start === "number") {
    return node.start;
  }
  if (node.loc) {
    return node.loc.start;
  }
  return null;
}

function locEnd(node) {
  const endNode = node.nodes && getLast(node.nodes);
  if (endNode && node.source && !node.source.end) {
    node = endNode;
  }

  if (node.__location) {
    return node.__location.endOffset;
  }

  const loc = node.range
    ? node.range[1]
    : typeof node.end === "number"
    ? node.end
    : null;

  if (node.typeAnnotation) {
    return Math.max(loc, locEnd(node.typeAnnotation));
  }

  if (node.loc && !loc) {
    return node.loc.end;
  }

  return loc;
}

function composeLoc(startNode, endNodeOrLength = startNode) {
  const length = typeof endNodeOrLength === "number" ? endNodeOrLength : -1;
  const start = locStart(startNode);
  const end = length !== -1 ? start + length : locEnd(endNodeOrLength);
  const startLoc = startNode.loc.start;
  return {
    start,
    end,
    range: [start, end],
    loc: {
      start: startLoc,
      end:
        length !== -1
          ? { line: startLoc.line, column: startLoc.column + length }
          : endNodeOrLength.loc.end,
    },
  };
}

module.exports = {
  locStart,
  locEnd,
  composeLoc,
};
