"use strict";

// https://css-tricks.com/how-to-create-an-ie-only-stylesheet

// <!--[if ... ]> ... <![endif]-->
const IE_CONDITIONAL_START_END_COMMENT_REGEX = /^(\[if([^\]]*?)]>)([\S\s]*?)<!\s*\[endif]$/;
// <!--[if ... ]><!-->
const IE_CONDITIONAL_START_COMMENT_REGEX = /^\[if([^\]]*?)]><!$/;
// <!--<![endif]-->
const IE_CONDITIONAL_END_COMMENT_REGEX = /^<!\s*\[endif]$/;

const REGEX_PARSE_TUPLES = [
  [IE_CONDITIONAL_START_END_COMMENT_REGEX, parseIeConditionalStartEndComment],
  [IE_CONDITIONAL_START_COMMENT_REGEX, parseIeConditionalStartComment],
  [IE_CONDITIONAL_END_COMMENT_REGEX, parseIeConditionalEndComment],
];

function parseIeConditionalComment(node, parseHtml) {
  if (node.value) {
    let match;
    for (const [regex, parse] of REGEX_PARSE_TUPLES) {
      if ((match = node.value.match(regex))) {
        return parse(node, parseHtml, match);
      }
    }
  }
  return null;
}

function parseIeConditionalStartEndComment(node, parseHtml, match) {
  const [, openingTagSuffix, condition, data] = match;
  const offset = "<!--".length + openingTagSuffix.length;
  const contentStartSpan = node.sourceSpan.start.moveBy(offset);
  const contentEndSpan = contentStartSpan.moveBy(data.length);
  const ParseSourceSpan = node.sourceSpan.constructor;
  const [complete, children] = (() => {
    try {
      return [true, parseHtml(data, contentStartSpan).children];
    } catch (e) {
      const text = {
        type: "text",
        value: data,
        sourceSpan: new ParseSourceSpan(contentStartSpan, contentEndSpan),
      };
      return [false, [text]];
    }
  })();
  return {
    type: "ieConditionalComment",
    complete,
    children,
    condition: condition.trim().replace(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
    startSourceSpan: new ParseSourceSpan(
      node.sourceSpan.start,
      contentStartSpan
    ),
    endSourceSpan: new ParseSourceSpan(contentEndSpan, node.sourceSpan.end),
  };
}

function parseIeConditionalStartComment(node, parseHtml, match) {
  const [, condition] = match;
  return {
    type: "ieConditionalStartComment",
    condition: condition.trim().replace(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
  };
}

function parseIeConditionalEndComment(node /*, parseHtml, match */) {
  return {
    type: "ieConditionalEndComment",
    sourceSpan: node.sourceSpan,
  };
}

module.exports = {
  parseIeConditionalComment,
};
