"use strict";

const comments = require("./comments");

function findSiblingAncestors(
  startNodeAndParents,
  endNodeAndParents,
  opts,
  root
) {
  let resultStartNode = startNodeAndParents.node;
  let resultEndNode = endNodeAndParents.node;

  if (resultStartNode === resultEndNode) {
    return {
      startNode: resultStartNode,
      endNode: resultEndNode,
    };
  }

  for (const endParent of endNodeAndParents.parentNodes) {
    if (
      endParent !== root &&
      // There is little difference between `babel` and other JS parsers,
      // TODO: remove this condition
      endParent.type !== "Program" &&
      opts.locStart(endParent) >= opts.locStart(startNodeAndParents.node)
    ) {
      resultEndNode = endParent;
    } else {
      break;
    }
  }

  for (const startParent of startNodeAndParents.parentNodes) {
    if (
      startParent.type !== root &&
      // See comment above
      startParent.type !== "Program" &&
      opts.locEnd(startParent) <= opts.locEnd(endNodeAndParents.node)
    ) {
      resultStartNode = startParent;
    } else {
      break;
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode,
  };
}

function findNodeAtOffset(node, offset, options, predicate, parentNodes = []) {
  if (
    !node ||
    offset < options.locStart(node) ||
    offset > options.locEnd(node)
  ) {
    return;
  }

  for (const childNode of comments.getSortedChildNodes(node, options)) {
    const childResult = findNodeAtOffset(
      childNode,
      offset,
      options,
      predicate,
      [node, ...parentNodes]
    );
    if (childResult) {
      return childResult;
    }
  }

  if (!predicate || predicate(node)) {
    return {
      node,
      parentNodes,
    };
  }
}

function calculateRange(text, opts, ast, selectedParser) {
  const { isSourceElement } = selectedParser;
  if (!isSourceElement) {
    return {
      rangeStart: 0,
      rangeEnd: 0,
    };
  }

  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const rangeStringOrig = text.slice(opts.rangeStart, opts.rangeEnd);
  const startNonWhitespace = Math.max(
    opts.rangeStart + rangeStringOrig.search(/\S/),
    opts.rangeStart
  );
  let endNonWhitespace;
  for (
    endNonWhitespace = opts.rangeEnd;
    endNonWhitespace > opts.rangeStart;
    --endNonWhitespace
  ) {
    if (/\S/.test(text[endNonWhitespace - 1])) {
      break;
    }
  }

  const startNodeAndParents = findNodeAtOffset(
    ast,
    startNonWhitespace,
    opts,
    (node) => isSourceElement(node)
  );
  const endNodeAndParents = findNodeAtOffset(
    ast,
    endNonWhitespace,
    opts,
    (node) => isSourceElement(node)
  );

  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0,
    };
  }

  const { startNode, endNode } = findSiblingAncestors(
    startNodeAndParents,
    endNodeAndParents,
    opts,
    ast
  );

  return {
    rangeStart: Math.min(opts.locStart(startNode), opts.locStart(endNode)),
    rangeEnd: Math.max(opts.locEnd(startNode), opts.locEnd(endNode)),
  };
}

module.exports = {
  calculateRange,
  findNodeAtOffset,
};
