"use strict";

const { getLast, isNonEmptyArray } = require("../common/util");

function getAncestorCount(path, filter) {
  let counter = 0;
  const pathStackLength = path.stack.length - 1;
  for (let i = 0; i < pathStackLength; i++) {
    const value = path.stack[i];
    if (isNode(value) && filter(value)) {
      counter++;
    }
  }
  return counter;
}

/**
 * @param {any} value
 * @param {string[]=} types
 */
function isNode(value, types) {
  return (
    value &&
    typeof value.type === "string" &&
    (!types || types.includes(value.type))
  );
}

function mapNode(node, callback, parent) {
  return callback(
    "children" in node
      ? {
          ...node,
          children: node.children.map((childNode) =>
            mapNode(childNode, callback, node)
          ),
        }
      : node,
    parent
  );
}

function defineShortcut(x, key, getter) {
  Object.defineProperty(x, key, {
    get: getter,
    enumerable: false,
  });
}

function isNextLineEmpty(node, text) {
  let newlineCount = 0;
  const textLength = text.length;
  for (let i = node.position.end.offset - 1; i < textLength; i++) {
    const char = text[i];

    if (char === "\n") {
      newlineCount++;
    }

    if (newlineCount === 1 && /\S/.test(char)) {
      return false;
    }

    if (newlineCount === 2) {
      return true;
    }
  }

  return false;
}

function isLastDescendantNode(path) {
  const node = path.getValue();

  switch (node.type) {
    case "tag":
    case "anchor":
    case "comment":
      return false;
  }

  const pathStackLength = path.stack.length;

  for (let i = 1; i < pathStackLength; i++) {
    const item = path.stack[i];
    const parentItem = path.stack[i - 1];

    if (
      Array.isArray(parentItem) &&
      typeof item === "number" &&
      item !== parentItem.length - 1
    ) {
      return false;
    }
  }

  return true;
}

function getLastDescendantNode(node) {
  return isNonEmptyArray(node.children)
    ? getLastDescendantNode(getLast(node.children))
    : node;
}

function isPrettierIgnore(comment) {
  return comment.value.trim() === "prettier-ignore";
}

function hasPrettierIgnore(path) {
  const node = path.getValue();

  if (node.type === "documentBody") {
    const document = path.getParentNode();
    return (
      hasEndComments(document.head) &&
      isPrettierIgnore(getLast(document.head.endComments))
    );
  }

  return (
    hasLeadingComments(node) && isPrettierIgnore(getLast(node.leadingComments))
  );
}

function isEmptyNode(node) {
  return !isNonEmptyArray(node.children) && !hasComments(node);
}

function hasComments(node) {
  return (
    hasLeadingComments(node) ||
    hasMiddleComments(node) ||
    hasIndicatorComment(node) ||
    hasTrailingComment(node) ||
    hasEndComments(node)
  );
}

function hasLeadingComments(node) {
  return node && isNonEmptyArray(node.leadingComments);
}

function hasMiddleComments(node) {
  return node && isNonEmptyArray(node.middleComments);
}

function hasIndicatorComment(node) {
  return node && node.indicatorComment;
}

function hasTrailingComment(node) {
  return node && node.trailingComment;
}

function hasEndComments(node) {
  return node && isNonEmptyArray(node.endComments);
}

/**
 * " a   b c   d e   f " -> [" a   b", "c   d", "e   f "]
 */
function splitWithSingleSpace(text) {
  const parts = [];

  let lastPart;
  for (const part of text.split(/( +)/g)) {
    /* istanbul ignore else */
    if (part !== " ") {
      if (lastPart === " ") {
        parts.push(part);
      } else {
        parts.push((parts.pop() || "") + part);
      }
    } else if (lastPart === undefined) {
      parts.unshift("");
    }

    lastPart = part;
  }

  /* istanbul ignore next */
  if (lastPart === " ") {
    parts.push(`${parts.pop() || ""} `);
  }

  if (parts[0] === "") {
    parts.shift();
    parts.unshift(` ${parts.shift() || ""}`);
  }

  return parts;
}

function getFlowScalarLineContents(nodeType, content, options) {
  const rawLineContents = content
    .split("\n")
    .map((lineContent, index, lineContents) =>
      index === 0 && index === lineContents.length - 1
        ? lineContent
        : index !== 0 && index !== lineContents.length - 1
        ? lineContent.trim()
        : index === 0
        ? lineContent.trimEnd()
        : lineContent.trimStart()
    );

  if (options.proseWrap === "preserve") {
    return rawLineContents.map((lineContent) =>
      lineContent.length === 0 ? [] : [lineContent]
    );
  }

  return rawLineContents
    .map((lineContent) =>
      lineContent.length === 0 ? [] : splitWithSingleSpace(lineContent)
    )
    .reduce(
      (reduced, lineContentWords, index) =>
        index !== 0 &&
        rawLineContents[index - 1].length > 0 &&
        lineContentWords.length > 0 &&
        !(
          // trailing backslash in quoteDouble should be preserved
          (
            nodeType === "quoteDouble" &&
            getLast(getLast(reduced)).endsWith("\\")
          )
        )
          ? [
              ...reduced.slice(0, -1),
              [...getLast(reduced), ...lineContentWords],
            ]
          : [...reduced, lineContentWords],
      []
    )
    .map((lineContentWords) =>
      options.proseWrap === "never"
        ? [lineContentWords.join(" ")]
        : lineContentWords
    );
}

function getBlockValueLineContents(
  node,
  { parentIndent, isLastDescendant, options }
) {
  const content =
    node.position.start.line === node.position.end.line
      ? ""
      : options.originalText
          .slice(node.position.start.offset, node.position.end.offset)
          // exclude open line `>` or `|`
          .match(/^[^\n]*?\n([\S\s]*)$/)[1];

  const leadingSpaceCount =
    node.indent === null
      ? ((match) => (match ? match[1].length : Number.POSITIVE_INFINITY))(
          content.match(/^( *)\S/m)
        )
      : node.indent - 1 + parentIndent;

  const rawLineContents = content
    .split("\n")
    .map((lineContent) => lineContent.slice(leadingSpaceCount));

  if (options.proseWrap === "preserve" || node.type === "blockLiteral") {
    return removeUnnecessaryTrailingNewlines(
      rawLineContents.map((lineContent) =>
        lineContent.length === 0 ? [] : [lineContent]
      )
    );
  }

  return removeUnnecessaryTrailingNewlines(
    rawLineContents
      .map((lineContent) =>
        lineContent.length === 0 ? [] : splitWithSingleSpace(lineContent)
      )
      .reduce(
        (reduced, lineContentWords, index) =>
          index !== 0 &&
          rawLineContents[index - 1].length > 0 &&
          lineContentWords.length > 0 &&
          !/^\s/.test(lineContentWords[0]) &&
          !/^\s|\s$/.test(getLast(reduced))
            ? [
                ...reduced.slice(0, -1),
                [...getLast(reduced), ...lineContentWords],
              ]
            : [...reduced, lineContentWords],
        []
      )
      .map((lineContentWords) =>
        lineContentWords.reduce(
          (reduced, word) =>
            // disallow trailing spaces
            reduced.length > 0 && /\s$/.test(getLast(reduced))
              ? [...reduced.slice(0, -1), `${getLast(reduced)} ${word}`]
              : [...reduced, word],
          []
        )
      )
      .map((lineContentWords) =>
        options.proseWrap === "never"
          ? [lineContentWords.join(" ")]
          : lineContentWords
      )
  );

  function removeUnnecessaryTrailingNewlines(lineContents) {
    if (node.chomping === "keep") {
      return getLast(lineContents).length === 0
        ? lineContents.slice(0, -1)
        : lineContents;
    }

    let trailingNewlineCount = 0;
    for (let i = lineContents.length - 1; i >= 0; i--) {
      if (lineContents[i].length === 0) {
        trailingNewlineCount++;
      } else {
        break;
      }
    }

    return trailingNewlineCount === 0
      ? lineContents
      : trailingNewlineCount >= 2 && !isLastDescendant
      ? // next empty line
        lineContents.slice(0, -(trailingNewlineCount - 1))
      : lineContents.slice(0, -trailingNewlineCount);
  }
}

function isInlineNode(node) {
  /* istanbul ignore next */
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
    case "alias":
    case "flowMapping":
    case "flowSequence":
      return true;
    default:
      return false;
  }
}

module.exports = {
  getLast,
  getAncestorCount,
  isNode,
  isEmptyNode,
  isInlineNode,
  mapNode,
  defineShortcut,
  isNextLineEmpty,
  isLastDescendantNode,
  getBlockValueLineContents,
  getFlowScalarLineContents,
  getLastDescendantNode,
  hasPrettierIgnore,
  hasLeadingComments,
  hasMiddleComments,
  hasIndicatorComment,
  hasTrailingComment,
  hasEndComments,
};
