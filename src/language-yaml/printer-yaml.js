"use strict";

/** @typedef {import("../document").Doc} Doc */

const {
  builders: {
    breakParent,
    fill,
    group,
    hardline,
    join,
    line,
    lineSuffix,
    literalline,
  },
  utils: { getDocParts },
} = require("../document");
const { replaceEndOfLineWith, isPreviousLineEmpty } = require("../common/util");
const { insertPragma, isPragma } = require("./pragma");
const { locStart } = require("./loc");
const embed = require("./embed");
const {
  getFlowScalarLineContents,
  getLastDescendantNode,
  hasLeadingComments,
  hasMiddleComments,
  hasTrailingComment,
  hasEndComments,
  hasPrettierIgnore,
  isLastDescendantNode,
  isNode,
  isInlineNode,
} = require("./utils");
const preprocess = require("./print-preprocess");
const {
  alignWithSpaces,
  printNextEmptyLine,
  shouldPrintEndComments,
} = require("./print/misc");
const {
  printFlowMapping,
  printFlowSequence,
} = require("./print/flow-mapping-sequence");
const printMappingItem = require("./print/mapping-item");
const printBlock = require("./print/block");

function genericPrint(path, options, print) {
  const node = path.getValue();
  /** @type {Doc[]} */
  const parts = [];

  if (node.type !== "mappingValue" && hasLeadingComments(node)) {
    parts.push([join(hardline, path.map(print, "leadingComments")), hardline]);
  }

  const { tag, anchor } = node;
  if (tag) {
    parts.push(print("tag"));
  }
  if (tag && anchor) {
    parts.push(" ");
  }
  if (anchor) {
    parts.push(print("anchor"));
  }

  /** @type {Doc} */
  let nextEmptyLine = "";

  if (
    isNode(node, [
      "mapping",
      "sequence",
      "comment",
      "directive",
      "mappingItem",
      "sequenceItem",
    ]) &&
    !isLastDescendantNode(path)
  ) {
    nextEmptyLine = printNextEmptyLine(path, options.originalText);
  }

  if (tag || anchor) {
    if (isNode(node, ["sequence", "mapping"]) && !hasMiddleComments(node)) {
      parts.push(hardline);
    } else {
      parts.push(" ");
    }
  }

  if (hasMiddleComments(node)) {
    parts.push([
      node.middleComments.length === 1 ? "" : hardline,
      join(hardline, path.map(print, "middleComments")),
      hardline,
    ]);
  }

  const parentNode = path.getParentNode();
  if (hasPrettierIgnore(path)) {
    parts.push(
      replaceEndOfLineWith(
        options.originalText
          .slice(node.position.start.offset, node.position.end.offset)
          .trimEnd(),
        literalline
      )
    );
  } else {
    parts.push(group(printNode(node, parentNode, path, options, print)));
  }

  if (hasTrailingComment(node) && !isNode(node, ["document", "documentHead"])) {
    parts.push(
      lineSuffix([
        node.type === "mappingValue" && !node.content ? "" : " ",
        parentNode.type === "mappingKey" &&
        path.getParentNode(2).type === "mapping" &&
        isInlineNode(node)
          ? ""
          : breakParent,
        print("trailingComment"),
      ])
    );
  }

  if (shouldPrintEndComments(node)) {
    parts.push(
      alignWithSpaces(node.type === "sequenceItem" ? 2 : 0, [
        hardline,
        join(
          hardline,
          path.mapValue(
            (node) => [
              isPreviousLineEmpty(options.originalText, node, locStart)
                ? hardline
                : "",
              print(),
            ],
            "endComments"
          )
        ),
      ])
    );
  }
  parts.push(nextEmptyLine);
  return parts;
}

function printNode(node, parentNode, path, options, print) {
  switch (node.type) {
    case "root": {
      const { children } = node;
      const parts = [];
      path.eachValue((child, index) => {
        const document = children[index];
        const nextDocument = children[index + 1];
        if (index !== 0) {
          parts.push(hardline);
        }
        parts.push(print());
        if (shouldPrintDocumentEndMarker(document, nextDocument)) {
          parts.push(hardline, "...");
          if (hasTrailingComment(document)) {
            parts.push(" ", print("trailingComment"));
          }
        } else if (nextDocument && !hasTrailingComment(nextDocument.head)) {
          parts.push(hardline, "---");
        }
      }, "children");

      const lastDescendantNode = getLastDescendantNode(node);
      if (
        !isNode(lastDescendantNode, ["blockLiteral", "blockFolded"]) ||
        lastDescendantNode.chomping !== "keep"
      ) {
        parts.push(hardline);
      }
      return parts;
    }
    case "document": {
      const nextDocument = parentNode.children[path.getName() + 1];
      const parts = [];
      if (
        shouldPrintDocumentHeadEndMarker(
          node,
          nextDocument,
          parentNode,
          options
        ) === "head"
      ) {
        if (node.head.children.length > 0 || node.head.endComments.length > 0) {
          parts.push(print("head"));
        }

        if (hasTrailingComment(node.head)) {
          parts.push(["---", " ", print(["head", "trailingComment"])]);
        } else {
          parts.push("---");
        }
      }

      if (shouldPrintDocumentBody(node)) {
        parts.push(print("body"));
      }

      return join(hardline, parts);
    }
    case "documentHead":
      return join(hardline, [
        ...path.map(print, "children"),
        ...path.map(print, "endComments"),
      ]);
    case "documentBody": {
      const { children, endComments } = node;
      /** @type {Doc} */
      let separator = "";
      if (children.length > 0 && endComments.length > 0) {
        const lastDescendantNode = getLastDescendantNode(node);
        // there's already a newline printed at the end of blockValue (chomping=keep, lastDescendant=true)
        if (isNode(lastDescendantNode, ["blockFolded", "blockLiteral"])) {
          // an extra newline for better readability
          if (lastDescendantNode.chomping !== "keep") {
            separator = [hardline, hardline];
          }
        } else {
          separator = hardline;
        }
      }

      return [
        join(hardline, path.map(print, "children")),
        separator,
        join(hardline, path.map(print, "endComments")),
      ];
    }
    case "directive":
      return ["%", join(" ", [node.name, ...node.parameters])];
    case "comment":
      return ["#", node.value];
    case "alias":
      return ["*", node.value];
    case "tag":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "anchor":
      return ["&", node.value];
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
        return [
          originalQuote,
          printFlowScalarContent(node.type, raw, options),
          originalQuote,
        ];
      }

      if (raw.includes(doubleQuote)) {
        return [
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
        ];
      }

      if (raw.includes(singleQuote)) {
        return [
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
        ];
      }

      const quote = options.singleQuote ? singleQuote : doubleQuote;
      return [quote, printFlowScalarContent(node.type, raw, options), quote];
    }
    case "blockFolded":
    case "blockLiteral": {
      return printBlock(path, print, options);
    }
    case "mapping":
    case "sequence":
      return join(hardline, path.map(print, "children"));
    case "sequenceItem":
      return ["- ", alignWithSpaces(2, !node.content ? "" : print("content"))];
    case "mappingKey":
    case "mappingValue":
      return !node.content ? "" : print("content");
    case "mappingItem":
    case "flowMappingItem": {
      return printMappingItem(node, parentNode, path, print, options);
    }
    case "flowMapping":
      return printFlowMapping(path, print, options);
    case "flowSequence":
      return printFlowSequence(path, print, options);
    case "flowSequenceItem":
      return print("content");
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function shouldPrintDocumentBody(document) {
  return document.body.children.length > 0 || hasEndComments(document.body);
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
      (nextDocument.head.children.length > 0 ||
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
        options.originalText.slice(locStart(document), locStart(document) + 4)
      )) ||
    /**
     * %DIRECTIVE
     * ---
     */
    document.head.children.length > 0 ||
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

function printFlowScalarContent(nodeType, content, options) {
  const lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join(
    hardline,
    lineContents.map((lineContentWords) =>
      fill(getDocParts(join(line, lineContentWords)))
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
  embed,
  print: genericPrint,
  massageAstNode: clean,
  insertPragma,
};
