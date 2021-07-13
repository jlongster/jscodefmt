"use strict";

/** @typedef {import("../../document").Doc} Doc */

const {
  builders: { conditionalGroup, group, hardline, ifBreak, join, line },
} = require("../../document");
const {
  hasLeadingComments,
  hasMiddleComments,
  hasTrailingComment,
  hasEndComments,
  isNode,
  isEmptyNode,
  isInlineNode,
} = require("../utils");
const { alignWithSpaces } = require("./misc");

function printMappingItem(node, parentNode, path, print, options) {
  const { key, value } = node;

  const isEmptyMappingKey = isEmptyNode(key);
  const isEmptyMappingValue = isEmptyNode(value);

  if (isEmptyMappingKey && isEmptyMappingValue) {
    return ": ";
  }

  const printedKey = print("key");
  const spaceBeforeColon = needsSpaceInFrontOfMappingValue(node) ? " " : "";

  if (isEmptyMappingValue) {
    if (node.type === "flowMappingItem" && parentNode.type === "flowMapping") {
      return printedKey;
    }

    if (
      node.type === "mappingItem" &&
      isAbsolutelyPrintedAsSingleLineNode(key.content, options) &&
      !hasTrailingComment(key.content) &&
      (!parentNode.tag || parentNode.tag.value !== "tag:yaml.org,2002:set")
    ) {
      return [printedKey, spaceBeforeColon, ":"];
    }

    return ["? ", alignWithSpaces(2, printedKey)];
  }

  const printedValue = print("value");
  if (isEmptyMappingKey) {
    return [":" + (value.content ? " " : ""), alignWithSpaces(2, printedValue)];
  }

  // force explicit Key
  if (hasLeadingComments(value) || !isInlineNode(key.content)) {
    return [
      "? ",
      alignWithSpaces(2, printedKey),
      hardline,
      join(
        "",
        path
          .map(print, "value", "leadingComments")
          .map((comment) => [comment, hardline])
      ),
      ": ",
      alignWithSpaces(2, printedValue),
    ];
  }

  // force singleline
  if (
    isSingleLineNode(key.content) &&
    !hasLeadingComments(key.content) &&
    !hasMiddleComments(key.content) &&
    !hasTrailingComment(key.content) &&
    !hasEndComments(key) &&
    !hasLeadingComments(value.content) &&
    !hasMiddleComments(value.content) &&
    !hasTrailingComment(value) &&
    !hasEndComments(value) &&
    isAbsolutelyPrintedAsSingleLineNode(value.content, options)
  ) {
    return [printedKey, spaceBeforeColon, ": ", printedValue];
  }

  const groupId = Symbol("mappingKey");
  const groupedKey = group([
    ifBreak("? "),
    group(alignWithSpaces(2, printedKey), { id: groupId }),
  ]);

  // Construct both explicit and implicit mapping values.
  const explicitMappingValue = [
    hardline,
    ": ",
    alignWithSpaces(2, printedValue),
  ];
  /** @type {Doc[]} */
  // In the implicit case, it's convenient to treat everything from the key's colon
  // as part of the mapping value
  const implicitMappingValueParts = [spaceBeforeColon, ":"];
  if (
    hasLeadingComments(value.content) ||
    (hasEndComments(value) &&
      value.content &&
      !isNode(value.content, ["mapping", "sequence"])) ||
    (parentNode.type === "mapping" &&
      hasTrailingComment(key.content) &&
      isInlineNode(value.content)) ||
    (isNode(value.content, ["mapping", "sequence"]) &&
      value.content.tag === null &&
      value.content.anchor === null)
  ) {
    implicitMappingValueParts.push(hardline);
  } else if (value.content) {
    implicitMappingValueParts.push(line);
  }
  implicitMappingValueParts.push(printedValue);
  const implicitMappingValue = alignWithSpaces(
    options.tabWidth,
    implicitMappingValueParts
  );

  // If a key is definitely single-line, forcibly use implicit style to avoid edge cases (very long
  // keys) that would otherwise trigger explicit style as if it was multiline.
  // In those cases, explicit style makes the line even longer and causes confusion.
  if (
    isAbsolutelyPrintedAsSingleLineNode(key.content, options) &&
    !hasLeadingComments(key.content) &&
    !hasMiddleComments(key.content) &&
    !hasEndComments(key)
  ) {
    return conditionalGroup([[printedKey, implicitMappingValue]]);
  }

  // Use explicit mapping syntax if the key breaks, implicit otherwise
  return conditionalGroup([
    [
      groupedKey,
      ifBreak(explicitMappingValue, implicitMappingValue, { groupId }),
    ],
  ]);
}

function isAbsolutelyPrintedAsSingleLineNode(node, options) {
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteSingle":
    case "quoteDouble":
      break;
    case "alias":
      return true;

    default:
      return false;
  }

  if (options.proseWrap === "preserve") {
    return node.position.start.line === node.position.end.line;
  }

  if (
    // backslash-newline
    /\\$/m.test(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      )
    )
  ) {
    return false;
  }

  switch (options.proseWrap) {
    case "never":
      return !node.value.includes("\n");
    case "always":
      return !/[\n ]/.test(node.value);
    // istanbul ignore next
    default:
      return false;
  }
}

function needsSpaceInFrontOfMappingValue(node) {
  return node.key.content && node.key.content.type === "alias";
}

function isSingleLineNode(node) {
  /* istanbul ignore next */
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
      return node.position.start.line === node.position.end.line;
    case "alias":
      return true;
    default:
      return false;
  }
}

module.exports = printMappingItem;
