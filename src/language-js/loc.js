"use strict";

const { isNonEmptyArray } = require("../common/util");

/**
 * @typedef {import("./types/estree").Node} Node
 */

function locStart(node) {
  // Handle nodes with decorators. They should start at the first decorator
  const decorators =
    (node.declaration && node.declaration.decorators) || node.decorators;
  if (isNonEmptyArray(decorators)) {
    return locStartWithoutDecorator(decorators[0]);
  }

  return locStartWithoutDecorator(node);
}

function locStartWithoutDecorator(node) {
  return node.range ? node.range[0] : node.start;
}

function locEnd(node) {
  return node.range ? node.range[1] : node.end;
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocStart(nodeA, nodeB) {
  return locStart(nodeA) === locStart(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  return locEnd(nodeA) === locEnd(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLoc(nodeA, nodeB) {
  return hasSameLocStart(nodeA, nodeB) && hasSameLocEnd(nodeA, nodeB);
}

module.exports = {
  locStart,
  locEnd,
  locStartWithoutDecorator,
  hasSameLocStart,
  hasSameLoc,
};
