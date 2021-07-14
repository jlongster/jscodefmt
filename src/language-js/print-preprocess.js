"use strict";

function preprocess(ast, options) {
  markIgnoredNodes(ast, options);

  switch (options.parser) {
    case "json":
    case "json5":
    case "json-stringify":
    case "__js_expression":
    case "__vue_expression":
      return {
        ...ast,
        type: options.parser.startsWith("__") ? "JsExpressionRoot" : "JsonRoot",
        node: ast,
        comments: [],
        rootMarker: options.rootMarker,
      };
    default:
      return ast;
  }
}

function markIgnoredNodes(node, options, key = "root", isIgnoring = false) {
  if (!node) {
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value.type === "string") {
      markIgnoredNodes(value, options, key, isIgnoring);
    } else if (Array.isArray(value)) {
      let ignoring = false;
      value.forEach(elem => {
        if (hasLeadingStartComment(elem)) {
          ignoring = true;
          console.log("ignoring start", elem);
        }
        if (hasLeadingEndComment(elem)) {
          ignoring = false;
          console.log("ignoring ended", elem);
        }

        if (ignoring) {
          elem.prettierIgnore = ignoring;
          console.log("ignoring contd", elem);
        } else {
          markIgnoredNodes(elem, options, key);
        }

        if (hasTrailingStartComment(elem)) {
          ignoring = true
          console.log("ignoring start", elem);
        }
        if (hasTrailingEndComment(elem)) {
          if (!ignoring) { 
            console.log("Found prettier-ignore-end without a matching prettier-ignore-start", elem);
          }
          ignoring = false;
          console.log("ignoring ended", elem);
        }

      })
    }
  }
  return node;
}

function hasLeadingStartComment(node) {
  // TODO: use util#getComment instead of node.comments
  if (Array.isArray(node.comments)) {
    return node.comments
    .filter(comment => comment.leading)
    .filter(comment=>comment.value.includes("prettier-ignore-start")).length > 0;
  }
  return false;
}
function hasLeadingEndComment(node) {
  // TODO: use util#getComment instead of node.comments
  if (Array.isArray(node.comments)) {
    return node.comments
    .filter(comment => comment.leading)
    .filter(comment=>comment.value.includes("prettier-ignore-end")).length > 0;
  }
  return false;
}


function hasTrailingStartComment(node) {
  // TODO: use util#getComment instead of node.comments
  if (Array.isArray(node.comments)) {
    return node.comments
    .filter(comment => comment.trailing)
    .filter(comment=>comment.value.includes("prettier-ignore-start")).length > 0;
  }
  return false;
}

function hasTrailingEndComment(node) {
  // TODO: use util#getComment instead of node.comments
  if (Array.isArray(node.comments)) {
    return node.comments
    .filter(comment => comment.trailing)
    .filter(comment=>comment.value.includes("prettier-ignore-end")).length > 0;
  }
  return false;
}

module.exports = preprocess;
