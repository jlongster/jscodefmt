"use strict";

const {
  cjkPattern,
  kPattern,
  punctuationPattern,
} = require("./constants.evaluate");
const { getLast } = require("../common/util");

const INLINE_NODE_TYPES = [
  "liquidNode",
  "inlineCode",
  "emphasis",
  "strong",
  "delete",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "footnote",
  "footnoteReference",
  "sentence",
  "whitespace",
  "word",
  "break",
  "inlineMath",
];

const INLINE_NODE_WRAPPER_TYPES = INLINE_NODE_TYPES.concat([
  "tableCell",
  "paragraph",
  "heading",
]);

const kRegex = new RegExp(kPattern);
const punctuationRegex = new RegExp(punctuationPattern);

/**
 * split text into whitespaces and words
 * @param {string} text
 * @return {Array<{ type: "whitespace", value: " " | "\n" | "" } | { type: "word", value: string }>}
 */
function splitText(text, options) {
  const KIND_NON_CJK = "non-cjk";
  const KIND_CJ_LETTER = "cj-letter";
  const KIND_K_LETTER = "k-letter";
  const KIND_CJK_PUNCTUATION = "cjk-punctuation";

  const nodes = [];

  (options.proseWrap === "preserve"
    ? text
    : text.replace(new RegExp(`(${cjkPattern})\n(${cjkPattern})`, "g"), "$1$2")
  )
    .split(/([\t\n ]+)/)
    .forEach((token, index, tokens) => {
      // whitespace
      if (index % 2 === 1) {
        nodes.push({
          type: "whitespace",
          value: /\n/.test(token) ? "\n" : " ",
        });
        return;
      }

      // word separated by whitespace

      if ((index === 0 || index === tokens.length - 1) && token === "") {
        return;
      }

      token
        .split(new RegExp(`(${cjkPattern})`))
        .forEach((innerToken, innerIndex, innerTokens) => {
          if (
            (innerIndex === 0 || innerIndex === innerTokens.length - 1) &&
            innerToken === ""
          ) {
            return;
          }

          // non-CJK word
          if (innerIndex % 2 === 0) {
            if (innerToken !== "") {
              appendNode({
                type: "word",
                value: innerToken,
                kind: KIND_NON_CJK,
                hasLeadingPunctuation: punctuationRegex.test(innerToken[0]),
                hasTrailingPunctuation: punctuationRegex.test(
                  getLast(innerToken)
                ),
              });
            }
            return;
          }

          // CJK character
          appendNode(
            punctuationRegex.test(innerToken)
              ? {
                  type: "word",
                  value: innerToken,
                  kind: KIND_CJK_PUNCTUATION,
                  hasLeadingPunctuation: true,
                  hasTrailingPunctuation: true,
                }
              : {
                  type: "word",
                  value: innerToken,
                  kind: kRegex.test(innerToken)
                    ? KIND_K_LETTER
                    : KIND_CJ_LETTER,
                  hasLeadingPunctuation: false,
                  hasTrailingPunctuation: false,
                }
          );
        });
    });

  return nodes;

  function appendNode(node) {
    const lastNode = getLast(nodes);
    if (lastNode && lastNode.type === "word") {
      if (
        (lastNode.kind === KIND_NON_CJK &&
          node.kind === KIND_CJ_LETTER &&
          !lastNode.hasTrailingPunctuation) ||
        (lastNode.kind === KIND_CJ_LETTER &&
          node.kind === KIND_NON_CJK &&
          !node.hasLeadingPunctuation)
      ) {
        nodes.push({ type: "whitespace", value: " " });
      } else if (
        !isBetween(KIND_NON_CJK, KIND_CJK_PUNCTUATION) &&
        // disallow leading/trailing full-width whitespace
        ![lastNode.value, node.value].some((value) => /\u3000/.test(value))
      ) {
        nodes.push({ type: "whitespace", value: "" });
      }
    }
    nodes.push(node);

    function isBetween(kind1, kind2) {
      return (
        (lastNode.kind === kind1 && node.kind === kind2) ||
        (lastNode.kind === kind2 && node.kind === kind1)
      );
    }
  }
}

function getOrderedListItemInfo(orderListItem, originalText) {
  const [, numberText, marker, leadingSpaces] = originalText
    .slice(
      orderListItem.position.start.offset,
      orderListItem.position.end.offset
    )
    .match(/^\s*(\d+)(\.|\))(\s*)/);

  return { numberText, marker, leadingSpaces };
}

function hasGitDiffFriendlyOrderedList(node, options) {
  if (!node.ordered) {
    return false;
  }

  if (node.children.length < 2) {
    return false;
  }

  const firstNumber = Number(
    getOrderedListItemInfo(node.children[0], options.originalText).numberText
  );

  const secondNumber = Number(
    getOrderedListItemInfo(node.children[1], options.originalText).numberText
  );

  if (firstNumber === 0 && node.children.length > 2) {
    const thirdNumber = Number(
      getOrderedListItemInfo(node.children[2], options.originalText).numberText
    );

    return secondNumber === 1 && thirdNumber === 1;
  }

  return secondNumber === 1;
}

// workaround for https://github.com/remarkjs/remark/issues/351
// leading and trailing newlines are stripped by remark
function getFencedCodeBlockValue(node, originalText) {
  const text = originalText.slice(
    node.position.start.offset,
    node.position.end.offset
  );

  const leadingSpaceCount = text.match(/^\s*/)[0].length;
  const replaceRegex = new RegExp(`^\\s{0,${leadingSpaceCount}}`);

  const lineContents = text.split("\n");

  const markerStyle = text[leadingSpaceCount]; // ` or ~
  const marker = text
    .slice(leadingSpaceCount)
    .match(new RegExp(`^[${markerStyle}]+`))[0];

  // https://spec.commonmark.org/0.28/#example-104: Closing fences may be indented by 0-3 spaces
  // https://spec.commonmark.org/0.28/#example-93: The closing code fence must be at least as long as the opening fence
  const hasEndMarker = new RegExp(`^\\s{0,3}${marker}`).test(
    lineContents[lineContents.length - 1].slice(
      getIndent(lineContents.length - 1)
    )
  );

  return lineContents
    .slice(1, hasEndMarker ? -1 : undefined)
    .map((x, i) => x.slice(getIndent(i + 1)).replace(replaceRegex, ""))
    .join("\n");

  function getIndent(lineIndex) {
    return node.position.indent[lineIndex - 1] - 1;
  }
}

function mapAst(ast, handler) {
  return (function preorder(node, index, parentStack) {
    parentStack = parentStack || [];

    const newNode = { ...handler(node, index, parentStack) };
    if (newNode.children) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, [newNode].concat(parentStack));
      });
    }

    return newNode;
  })(ast, null, null);
}

module.exports = {
  mapAst,
  splitText,
  punctuationPattern,
  getFencedCodeBlockValue,
  getOrderedListItemInfo,
  hasGitDiffFriendlyOrderedList,
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
};
