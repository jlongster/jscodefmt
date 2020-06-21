"use strict";

// http://w3c.github.io/html/single-page.html#void-elements
const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function isUppercase(string) {
  return string.toUpperCase() === string;
}

function isGlimmerComponent(node) {
  return (
    isNodeOfSomeType(node, ["ElementNode"]) &&
    typeof node.tag === "string" &&
    (isUppercase(node.tag[0]) || node.tag.includes("."))
  );
}

function isVoid(node) {
  return (
    (isGlimmerComponent(node) &&
      (node.children === 0 ||
        node.children.every((n) => isWhitespaceNode(n)))) ||
    voidTags.has(node.tag)
  );
}

function isWhitespaceNode(node) {
  return isNodeOfSomeType(node, ["TextNode"]) && !/\S/.test(node.chars);
}

function isNodeOfSomeType(node, types) {
  return node && types.some((type) => node.type === type);
}

function isParentOfSomeType(path, types) {
  const parentNode = path.getParentNode(0);
  return isNodeOfSomeType(parentNode, types);
}

function isPreviousNodeOfSomeType(path, types) {
  const previousNode = getPreviousNode(path);
  return isNodeOfSomeType(previousNode, types);
}

function isNextNodeOfSomeType(path, types) {
  const nextNode = getNextNode(path);
  return isNodeOfSomeType(nextNode, types);
}

function getSiblingNode(path, offset) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0) || {};
  const children =
    parentNode.children || parentNode.body || parentNode.parts || [];
  const index = children.indexOf(node);
  return index !== -1 && children[index + offset];
}

function getPreviousNode(path, lookBack = 1) {
  return getSiblingNode(path, -lookBack);
}

function getNextNode(path) {
  return getSiblingNode(path, 1);
}

function isPrettierIgnoreNode(node) {
  return (
    isNodeOfSomeType(node, ["MustacheCommentStatement"]) &&
    typeof node.value === "string" &&
    node.value.trim() === "prettier-ignore"
  );
}

function hasPrettierIgnore(path) {
  const node = path.getValue();
  const previousPreviousNode = getPreviousNode(path, 2);
  return (
    isPrettierIgnoreNode(node) || isPrettierIgnoreNode(previousPreviousNode)
  );
}

module.exports = {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isNextNodeOfSomeType,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isVoid,
  isWhitespaceNode,
};
