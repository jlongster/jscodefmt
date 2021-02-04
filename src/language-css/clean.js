"use strict";

const { isFrontMatterNode } = require("../common/util");
const getLast = require("../utils/get-last");

const ignoredProperties = new Set([
  "raw", // front-matter
  "raws",
  "sourceIndex",
  "source",
  "before",
  "after",
  "trailingComma",
]);

function clean(ast, newObj, parent) {
  if (isFrontMatterNode(ast) && ast.lang === "yaml") {
    delete newObj.value;
  }

  if (
    ast.type === "css-comment" &&
    parent.type === "css-root" &&
    parent.nodes.length > 0
  ) {
    // --insert-pragma
    // first non-front-matter comment
    if (
      parent.nodes[0] === ast ||
      (isFrontMatterNode(parent.nodes[0]) && parent.nodes[1] === ast)
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

    // Last comment is not parsed, when omitting semicolon, #8675
    if (parent.type === "css-root" && getLast(parent.nodes) === ast) {
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
    newObj.attribute = newObj.attribute.trim();

    if (newObj.namespace && typeof newObj.namespace === "string") {
      newObj.namespace = newObj.namespace.trim();

      if (newObj.namespace.length === 0) {
        newObj.namespace = true;
      }
    }

    if (newObj.value) {
      newObj.value = newObj.value.trim().replace(/^["']|["']$/g, "");
      delete newObj.quoted;
    }
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
        return Number.isNaN(num) ? match : num + unit.toLowerCase();
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

clean.ignoredProperties = ignoredProperties;

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^\dA-Fa-f])/g, "$1");
}

module.exports = clean;
