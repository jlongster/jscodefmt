"use strict";

const { isFrontMatterNode } = require("../common/util");

module.exports = function (ast, newNode) {
  delete newNode.sourceSpan;
  delete newNode.startSourceSpan;
  delete newNode.endSourceSpan;
  delete newNode.nameSpan;
  delete newNode.valueSpan;

  if (ast.type === "text" || ast.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (isFrontMatterNode(ast) || ast.type === "yaml" || ast.type === "toml") {
    return null;
  }

  if (ast.type === "attribute") {
    delete newNode.value;
  }

  if (ast.type === "docType") {
    delete newNode.value;
  }
};
