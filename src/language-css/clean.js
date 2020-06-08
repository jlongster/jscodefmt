"use strict";

const { isFrontMatterNode } = require("../common/util");

function clean(ast, newObj, parent) {
  [
    "raw", // front-matter
    "raws",
    "sourceIndex",
    "source",
    "before",
    "after",
    "trailingComma",
  ].forEach((name) => {
    delete newObj[name];
  });

  if (isFrontMatterNode(ast) && ast.lang === "yaml") {
    delete newObj.value;
  }

  // --insert-pragma
  if (
    ast.type === "css-comment" &&
    parent.type === "css-root" &&
    parent.nodes.length !== 0 &&
    // first non-front-matter comment
    (parent.nodes[0] === ast ||
      (isFrontMatterNode(parent.nodes[0]) && parent.nodes[1] === ast))
  ) {
    /**
     * something
     *
     * @format
     */
    delete newObj.text;

    // standalone pragma
    if (/^\*\s*@(format|prettier)\s*$/.test(ast.text)) {
      return null;
    }
  }

  if (ast.type === "value-root") {
    delete newObj.text;
  }

  if (
    ast.type === "media-query" ||
    ast.type === "media-query-list" ||
    ast.type === "media-feature-expression"
  ) {
    delete newObj.value;
  }

  if (ast.type === "css-rule") {
    delete newObj.params;
  }

  if (ast.type === "selector-combinator") {
    newObj.value = newObj.value.replace(/\s+/g, " ");
  }

  if (ast.type === "media-feature") {
    newObj.value = newObj.value.replace(/ /g, "");
  }

  if (
    (ast.type === "value-word" &&
      ((ast.isColor && ast.isHex) ||
        ["initial", "inherit", "unset", "revert"].includes(
          newObj.value.replace().toLowerCase()
        ))) ||
    ast.type === "media-feature" ||
    ast.type === "selector-root-invalid" ||
    ast.type === "selector-pseudo"
  ) {
    newObj.value = newObj.value.toLowerCase();
  }
  if (ast.type === "css-decl") {
    newObj.prop = newObj.prop.toLowerCase();
  }
  if (ast.type === "css-atrule" || ast.type === "css-import") {
    newObj.name = newObj.name.toLowerCase();
  }
  if (ast.type === "value-number") {
    newObj.unit = newObj.unit.toLowerCase();
  }

  if (
    (ast.type === "media-feature" ||
      ast.type === "media-keyword" ||
      ast.type === "media-type" ||
      ast.type === "media-unknown" ||
      ast.type === "media-url" ||
      ast.type === "media-value" ||
      ast.type === "selector-attribute" ||
      ast.type === "selector-string" ||
      ast.type === "selector-class" ||
      ast.type === "selector-combinator" ||
      ast.type === "value-string") &&
    newObj.value
  ) {
    newObj.value = cleanCSSStrings(newObj.value);
  }

  if (ast.type === "selector-attribute") {
    if (ast.namespace === "") {
      newObj.namespace = true;
    }

    if (typeof newObj.value === "string") {
      newObj.value = ast.getQuotedValue({
        quoteMark: '"',
        preferCurrentQuoteMark: false,
        smart: false,
      });
    }
    delete newObj.spaces;
    delete newObj.quoted;
    delete newObj._value;
    delete newObj._quoteMark;
  }

  if (
    (ast.type === "media-value" ||
      ast.type === "media-type" ||
      ast.type === "value-number" ||
      ast.type === "selector-root-invalid" ||
      ast.type === "selector-class" ||
      ast.type === "selector-combinator" ||
      ast.type === "selector-tag") &&
    newObj.value
  ) {
    newObj.value = newObj.value.replace(
      /([\d+.Ee-]+)([A-Za-z]*)/g,
      (match, numStr, unit) => {
        const num = Number(numStr);
        return isNaN(num) ? match : num + unit.toLowerCase();
      }
    );
  }

  if (ast.type === "selector-tag") {
    const lowercasedValue = ast.value.toLowerCase();

    if (["from", "to"].includes(lowercasedValue)) {
      newObj.value = lowercasedValue;
    }
  }

  // Workaround when `postcss-values-parser` parse `not`, `and` or `or` keywords as `value-func`
  if (ast.type === "css-atrule" && ast.name.toLowerCase() === "supports") {
    delete newObj.value;
  }

  // Workaround for SCSS nested properties
  if (ast.type === "selector-unknown") {
    delete newObj.value;
  }
}

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^\dA-Fa-f])/g, "$1");
}

module.exports = clean;
