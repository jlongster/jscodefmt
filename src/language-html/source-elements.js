"use strict";

function isVueSourceElement(node) {
  return node.tag !== "root";
}

module.exports = { isVueSourceElement };
