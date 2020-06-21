"use strict";

const { insertPragma, isPragma } = require("./pragma");
const {
  getAncestorCount,
  getBlockValueLineContents,
  getFlowScalarLineContents,
  getLast,
  getLastDescendantNode,
  hasLeadingComments,
  hasMiddleComments,
  hasIndicatorComment,
  hasTrailingComment,
  hasEndComments,
  hasPrettierIgnore,
  isLastDescendantNode,
  isNextLineEmpty,
  isNode,
  isEmptyNode,
  defineShortcut,
  mapNode,
} = require("./utils");
const docBuilders = require("../document").builders;
const {
  conditionalGroup,
  breakParent,
  concat,
  dedent,
  dedentToRoot,
  fill,
  group,
  hardline,
  ifBreak,
  join,
  line,
  lineSuffix,
  literalline,
  markAsRoot,
  softline,
} = docBuilders;
const { replaceEndOfLineWith, isPreviousLineEmpty } = require("../common/util");

function preprocess(ast) {
  return mapNode(ast, defineShortcuts);
}

function defineShortcuts(node) {
  switch (node.type) {
    case "document":
      defineShortcut(node, "head", () => node.children[0]);
      defineShortcut(node, "body", () => node.children[1]);
      break;
    case "documentBody":
    case "sequenceItem":
    case "flowSequenceItem":
    case "mappingKey":
    case "mappingValue":
      defineShortcut(node, "content", () => node.children[0]);
      break;
    case "mappingItem":
    case "flowMappingItem":
      defineShortcut(node, "key", () => node.children[0]);
      defineShortcut(node, "value", () => node.children[1]);
      break;
  }
  return node;
}

function genericPrint(path, options, print) {
  const node = path.getValue();
  const parentNode = path.getParentNode();

  const tag = !node.tag ? "" : path.call(print, "tag");
  const anchor = !node.anchor ? "" : path.call(print, "anchor");

  const nextEmptyLine =
    isNode(node, [
      "mapping",
      "sequence",
      "comment",
      "directive",
      "mappingItem",
      "sequenceItem",
    ]) && !isLastDescendantNode(path)
      ? printNextEmptyLine(path, options.originalText)
      : "";

  return concat([
    node.type !== "mappingValue" && hasLeadingComments(node)
      ? concat([join(hardline, path.map(print, "leadingComments")), hardline])
      : "",
    tag,
    tag && anchor ? " " : "",
    anchor,
    tag || anchor
      ? isNode(node, ["sequence", "mapping"]) && !hasMiddleComments(node)
        ? hardline
        : " "
      : "",
    hasMiddleComments(node)
      ? concat([
          node.middleComments.length === 1 ? "" : hardline,
          join(hardline, path.map(print, "middleComments")),
          hardline,
        ])
      : "",
    hasPrettierIgnore(path)
      ? concat(
          replaceEndOfLineWith(
            options.originalText
              .slice(node.position.start.offset, node.position.end.offset)
              .trimEnd(),
            literalline
          )
        )
      : group(_print(node, parentNode, path, options, print)),
    hasTrailingComment(node) && !isNode(node, ["document", "documentHead"])
      ? lineSuffix(
          concat([
            node.type === "mappingValue" && !node.content ? "" : " ",
            parentNode.type === "mappingKey" &&
            path.getParentNode(2).type === "mapping" &&
            isInlineNode(node)
              ? ""
              : breakParent,
            path.call(print, "trailingComment"),
          ])
        )
      : "",
    nextEmptyLine,
    hasEndComments(node) && !isNode(node, ["documentHead", "documentBody"])
      ? align(
          node.type === "sequenceItem" ? 2 : 0,
          concat([
            hardline,
            join(
              hardline,
              path.map(
                (path) =>
                  concat([
                    isPreviousLineEmpty(
                      options.originalText,
                      path.getValue(),
                      options.locStart
                    )
                      ? hardline
                      : "",
                    print(path),
                  ]),
                "endComments"
              )
            ),
          ])
        )
      : "",
  ]);
}

function _print(node, parentNode, path, options, print) {
  switch (node.type) {
    case "root":
      return concat([
        join(
          hardline,
          path.map((childPath, index) => {
            const document = node.children[index];
            const nextDocument = node.children[index + 1];
            return concat([
              print(childPath),
              shouldPrintDocumentEndMarker(document, nextDocument)
                ? concat([
                    hardline,
                    "...",
                    hasTrailingComment(document)
                      ? concat([" ", path.call(print, "trailingComment")])
                      : "",
                  ])
                : !nextDocument || hasTrailingComment(nextDocument.head)
                ? ""
                : concat([hardline, "---"]),
            ]);
          }, "children")
        ),
        node.children.length === 0 ||
        ((lastDescendantNode) =>
          isNode(lastDescendantNode, ["blockLiteral", "blockFolded"]) &&
          lastDescendantNode.chomping === "keep")(getLastDescendantNode(node))
          ? ""
          : hardline,
      ]);
    case "document": {
      const nextDocument = parentNode.children[path.getName() + 1];
      return join(
        hardline,
        [
          shouldPrintDocumentHeadEndMarker(
            node,
            nextDocument,
            parentNode,
            options
          ) === "head"
            ? join(
                hardline,
                [
                  node.head.children.length === 0 &&
                  node.head.endComments.length === 0
                    ? ""
                    : path.call(print, "head"),
                  concat([
                    "---",
                    hasTrailingComment(node.head)
                      ? concat([
                          " ",
                          path.call(print, "head", "trailingComment"),
                        ])
                      : "",
                  ]),
                ].filter(Boolean)
              )
            : "",
          shouldPrintDocumentBody(node) ? path.call(print, "body") : "",
        ].filter(Boolean)
      );
    }
    case "documentHead":
      return join(
        hardline,
        [].concat(path.map(print, "children"), path.map(print, "endComments"))
      );
    case "documentBody": {
      const children = join(hardline, path.map(print, "children")).parts;
      const endComments = join(hardline, path.map(print, "endComments")).parts;
      const separator =
        children.length === 0 || endComments.length === 0
          ? ""
          : ((lastDescendantNode) =>
              isNode(lastDescendantNode, ["blockFolded", "blockLiteral"])
                ? lastDescendantNode.chomping === "keep"
                  ? // there's already a newline printed at the end of blockValue (chomping=keep, lastDescendant=true)
                    ""
                  : // an extra newline for better readability
                    concat([hardline, hardline])
                : hardline)(getLastDescendantNode(node));
      return concat([].concat(children, separator, endComments));
    }
    case "directive":
      return concat(["%", join(" ", [node.name].concat(node.parameters))]);
    case "comment":
      return concat(["#", node.value]);
    case "alias":
      return concat(["*", node.value]);
    case "tag":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "anchor":
      return concat(["&", node.value]);
    case "plain":
      return printFlowScalarContent(
        node.type,
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset
        ),
        options
      );
    case "quoteDouble":
    case "quoteSingle": {
      const singleQuote = "'";
      const doubleQuote = '"';

      const raw = options.originalText.slice(
        node.position.start.offset + 1,
        node.position.end.offset - 1
      );

      if (
        (node.type === "quoteSingle" && raw.includes("\\")) ||
        (node.type === "quoteDouble" && /\\[^"]/.test(raw))
      ) {
        // only quoteDouble can use escape chars
        // and quoteSingle do not need to escape backslashes
        const originalQuote =
          node.type === "quoteDouble" ? doubleQuote : singleQuote;
        return concat([
          originalQuote,
          printFlowScalarContent(node.type, raw, options),
          originalQuote,
        ]);
      } else if (raw.includes(doubleQuote)) {
        return concat([
          singleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteDouble"
              ? raw
                  // double quote needs to be escaped by backslash in quoteDouble
                  .replace(/\\"/g, doubleQuote)
                  .replace(/'/g, singleQuote.repeat(2))
              : raw,
            options
          ),
          singleQuote,
        ]);
      }

      if (raw.includes(singleQuote)) {
        return concat([
          doubleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteSingle"
              ? // single quote needs to be escaped by 2 single quotes in quoteSingle
                raw.replace(/''/g, singleQuote)
              : raw,
            options
          ),
          doubleQuote,
        ]);
      }

      const quote = options.singleQuote ? singleQuote : doubleQuote;
      return concat([
        quote,
        printFlowScalarContent(node.type, raw, options),
        quote,
      ]);
    }
    case "blockFolded":
    case "blockLiteral": {
      const parentIndent = getAncestorCount(path, (ancestorNode) =>
        isNode(ancestorNode, ["sequence", "mapping"])
      );
      const isLastDescendant = isLastDescendantNode(path);
      return concat([
        node.type === "blockFolded" ? ">" : "|",
        node.indent === null ? "" : node.indent.toString(),
        node.chomping === "clip" ? "" : node.chomping === "keep" ? "+" : "-",
        hasIndicatorComment(node)
          ? concat([" ", path.call(print, "indicatorComment")])
          : "",
        (node.indent === null ? dedent : dedentToRoot)(
          align(
            node.indent === null
              ? options.tabWidth
              : node.indent - 1 + parentIndent,
            concat(
              getBlockValueLineContents(node, {
                parentIndent,
                isLastDescendant,
                options,
              }).reduce(
                (reduced, lineWords, index, lineContents) =>
                  reduced.concat(
                    index === 0 ? hardline : "",
                    fill(join(line, lineWords).parts),
                    index !== lineContents.length - 1
                      ? lineWords.length === 0
                        ? hardline
                        : markAsRoot(literalline)
                      : node.chomping === "keep" && isLastDescendant
                      ? lineWords.length === 0
                        ? dedentToRoot(hardline)
                        : dedentToRoot(literalline)
                      : ""
                  ),
                []
              )
            )
          )
        ),
      ]);
    }
    case "sequence":
      return join(hardline, path.map(print, "children"));
    case "sequenceItem":
      return concat([
        "- ",
        align(2, !node.content ? "" : path.call(print, "content")),
      ]);
    case "mappingKey":
      return !node.content ? "" : path.call(print, "content");
    case "mappingValue":
      return !node.content ? "" : path.call(print, "content");
    case "mapping":
      return join(hardline, path.map(print, "children"));
    case "mappingItem":
    case "flowMappingItem": {
      const isEmptyMappingKey = isEmptyNode(node.key);
      const isEmptyMappingValue = isEmptyNode(node.value);

      if (isEmptyMappingKey && isEmptyMappingValue) {
        return concat([": "]);
      }

      const key = path.call(print, "key");
      const value = path.call(print, "value");

      if (isEmptyMappingValue) {
        return node.type === "flowMappingItem" &&
          parentNode.type === "flowMapping"
          ? key
          : node.type === "mappingItem" &&
            isAbsolutelyPrintedAsSingleLineNode(node.key.content, options) &&
            !hasTrailingComment(node.key.content) &&
            (!parentNode.tag ||
              parentNode.tag.value !== "tag:yaml.org,2002:set")
          ? concat([key, needsSpaceInFrontOfMappingValue(node) ? " " : "", ":"])
          : concat(["? ", align(2, key)]);
      }

      if (isEmptyMappingKey) {
        return concat([": ", align(2, value)]);
      }

      const groupId = Symbol("mappingKey");

      const forceExplicitKey =
        hasLeadingComments(node.value) || !isInlineNode(node.key.content);

      return forceExplicitKey
        ? concat([
            "? ",
            align(2, key),
            hardline,
            join(
              "",
              path
                .map(print, "value", "leadingComments")
                .map((comment) => concat([comment, hardline]))
            ),
            ": ",
            align(2, value),
          ])
        : // force singleline
        isSingleLineNode(node.key.content) &&
          !hasLeadingComments(node.key.content) &&
          !hasMiddleComments(node.key.content) &&
          !hasTrailingComment(node.key.content) &&
          !hasEndComments(node.key) &&
          !hasLeadingComments(node.value.content) &&
          !hasMiddleComments(node.value.content) &&
          !hasEndComments(node.value) &&
          isAbsolutelyPrintedAsSingleLineNode(node.value.content, options)
        ? concat([
            key,
            needsSpaceInFrontOfMappingValue(node) ? " " : "",
            ": ",
            value,
          ])
        : conditionalGroup([
            concat([
              group(
                concat([ifBreak("? "), group(align(2, key), { id: groupId })])
              ),
              ifBreak(
                concat([hardline, ": ", align(2, value)]),
                indent(
                  concat([
                    needsSpaceInFrontOfMappingValue(node) ? " " : "",
                    ":",
                    hasLeadingComments(node.value.content) ||
                    (hasEndComments(node.value) &&
                      node.value.content &&
                      !isNode(node.value.content, ["mapping", "sequence"])) ||
                    (parentNode.type === "mapping" &&
                      hasTrailingComment(node.key.content) &&
                      isInlineNode(node.value.content)) ||
                    (isNode(node.value.content, ["mapping", "sequence"]) &&
                      node.value.content.tag === null &&
                      node.value.content.anchor === null)
                      ? hardline
                      : !node.value.content
                      ? ""
                      : line,
                    value,
                  ])
                ),
                { groupId }
              ),
            ]),
          ]);
    }
    case "flowMapping":
    case "flowSequence": {
      const openMarker = node.type === "flowMapping" ? "{" : "[";
      const closeMarker = node.type === "flowMapping" ? "}" : "]";
      const bracketSpacing =
        node.type === "flowMapping" &&
        node.children.length !== 0 &&
        options.bracketSpacing
          ? line
          : softline;
      const isLastItemEmptyMappingItem =
        node.children.length !== 0 &&
        ((lastItem) =>
          lastItem.type === "flowMappingItem" &&
          isEmptyNode(lastItem.key) &&
          isEmptyNode(lastItem.value))(getLast(node.children));
      return concat([
        openMarker,
        indent(
          concat([
            bracketSpacing,
            concat(
              path.map(
                (childPath, index) =>
                  concat([
                    print(childPath),
                    index === node.children.length - 1
                      ? ""
                      : concat([
                          ",",
                          line,
                          node.children[index].position.start.line !==
                          node.children[index + 1].position.start.line
                            ? printNextEmptyLine(
                                childPath,
                                options.originalText
                              )
                            : "",
                        ]),
                  ]),
                "children"
              )
            ),
            ifBreak(",", ""),
          ])
        ),
        isLastItemEmptyMappingItem ? "" : bracketSpacing,
        closeMarker,
      ]);
    }
    case "flowSequenceItem":
      return path.call(print, "content");
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }

  function indent(doc) {
    return docBuilders.align(" ".repeat(options.tabWidth), doc);
  }
}

function align(n, doc) {
  return typeof n === "number" && n > 0
    ? docBuilders.align(" ".repeat(n), doc)
    : docBuilders.align(n, doc);
}

function isInlineNode(node) {
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

function isSingleLineNode(node) {
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

function shouldPrintDocumentBody(document) {
  return document.body.children.length !== 0 || hasEndComments(document.body);
}

function shouldPrintDocumentEndMarker(document, nextDocument) {
  return (
    /**
     *... # trailingComment
     */
    hasTrailingComment(document) ||
    (nextDocument &&
      /**
       * ...
       * %DIRECTIVE
       * ---
       */
      (nextDocument.head.children.length !== 0 ||
        /**
         * ...
         * # endComment
         * ---
         */
        hasEndComments(nextDocument.head)))
  );
}

function shouldPrintDocumentHeadEndMarker(
  document,
  nextDocument,
  root,
  options
) {
  if (
    /**
     * ---
     * preserve the first document head end marker
     */
    (root.children[0] === document &&
      /---(\s|$)/.test(
        options.originalText.slice(
          options.locStart(document),
          options.locStart(document) + 4
        )
      )) ||
    /**
     * %DIRECTIVE
     * ---
     */
    document.head.children.length !== 0 ||
    /**
     * # end comment
     * ---
     */
    hasEndComments(document.head) ||
    /**
     * --- # trailing comment
     */
    hasTrailingComment(document.head)
  ) {
    return "head";
  }

  if (shouldPrintDocumentEndMarker(document, nextDocument)) {
    return false;
  }

  return nextDocument ? "root" : false;
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

function printNextEmptyLine(path, originalText) {
  const node = path.getValue();
  const root = path.stack[0];

  root.isNextEmptyLinePrintedChecklist =
    root.isNextEmptyLinePrintedChecklist || [];

  if (!root.isNextEmptyLinePrintedChecklist[node.position.end.line]) {
    if (isNextLineEmpty(node, originalText)) {
      root.isNextEmptyLinePrintedChecklist[node.position.end.line] = true;
      return softline;
    }
  }

  return "";
}

function printFlowScalarContent(nodeType, content, options) {
  const lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join(
    hardline,
    lineContents.map((lineContentWords) =>
      fill(join(line, lineContentWords).parts)
    )
  );
}

function clean(node, newNode /*, parent */) {
  if (isNode(newNode)) {
    delete newNode.position;
    switch (newNode.type) {
      case "comment":
        // insert pragma
        if (isPragma(newNode.value)) {
          return null;
        }
        break;
      case "quoteDouble":
      case "quoteSingle":
        newNode.type = "quote";
        break;
    }
  }
}

module.exports = {
  preprocess,
  print: genericPrint,
  massageAstNode: clean,
  insertPragma,
};
