"use strict";

const {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
} = require("./constants.evaluate");
const { getParserName, isFrontMatterNode } = require("../common/util");

const htmlTagNames = require("html-tag-names");
const htmlElementAttributes = require("html-element-attributes");

const HTML_TAGS = arrayToMap(htmlTagNames);
const HTML_ELEMENT_ATTRIBUTES = mapObject(htmlElementAttributes, arrayToMap);

// https://infra.spec.whatwg.org/#ascii-whitespace
const HTML_WHITESPACE = new Set(["\t", "\n", "\f", "\r", " "]);
const htmlTrimStart = (string) => string.replace(/^[\t\n\f\r ]+/, "");
const htmlTrimEnd = (string) => string.replace(/[\t\n\f\r ]+$/, "");
const htmlTrim = (string) => htmlTrimStart(htmlTrimEnd(string));
const htmlTrimLeadingBlankLines = (string) =>
  string.replace(/^[\t\f\r ]*?\n/g, "");
const htmlTrimPreserveIndentation = (string) =>
  htmlTrimLeadingBlankLines(htmlTrimEnd(string));
const splitByHtmlWhitespace = (string) => string.split(/[\t\n\f\r ]+/);
const getLeadingHtmlWhitespace = (string) => string.match(/^[\t\n\f\r ]*/)[0];
const getLeadingAndTrailingHtmlWhitespace = (string) => {
  const [, leadingWhitespace, text, trailingWhitespace] = string.match(
    /^([\t\n\f\r ]*)([\S\s]*?)([\t\n\f\r ]*)$/
  );
  return {
    leadingWhitespace,
    trailingWhitespace,
    text,
  };
};
const hasHtmlWhitespace = (string) => /[\t\n\f\r ]/.test(string);

function arrayToMap(array) {
  const map = Object.create(null);
  for (const value of array) {
    map[value] = true;
  }
  return map;
}

function mapObject(object, fn) {
  const newObject = Object.create(null);
  for (const key of Object.keys(object)) {
    newObject[key] = fn(object[key], key);
  }
  return newObject;
}

function shouldPreserveContent(node, options) {
  if (!node.endSourceSpan) {
    return false;
  }

  // unterminated node in ie conditional comment
  // e.g. <!--[if lt IE 9]><html><![endif]-->
  if (
    node.type === "ieConditionalComment" &&
    node.lastChild &&
    !node.lastChild.isSelfClosing &&
    !node.lastChild.endSourceSpan
  ) {
    return true;
  }

  // incomplete html in ie conditional comment
  // e.g. <!--[if lt IE 9]></div><![endif]-->
  if (node.type === "ieConditionalComment" && !node.complete) {
    return true;
  }

  // TODO: handle non-text children in <pre>
  if (
    isPreLikeNode(node) &&
    node.children.some(
      (child) => child.type !== "text" && child.type !== "interpolation"
    )
  ) {
    return true;
  }

  if (
    isVueNonHtmlBlock(node, options) &&
    !isScriptLikeTag(node) &&
    node.type !== "interpolation"
  ) {
    return true;
  }

  return false;
}

function hasPrettierIgnore(node) {
  if (node.type === "attribute") {
    return false;
  }

  if (!node.parent) {
    return false;
  }

  if (typeof node.index !== "number" || node.index === 0) {
    return false;
  }

  const prevNode = node.parent.children[node.index - 1];
  return isPrettierIgnore(prevNode);
}

function isPrettierIgnore(node) {
  return node.type === "comment" && node.value.trim() === "prettier-ignore";
}

function getPrettierIgnoreAttributeCommentData(value) {
  const match = value.trim().match(/^prettier-ignore-attribute(?:\s+([^]+))?$/);

  if (!match) {
    return false;
  }

  if (!match[1]) {
    return true;
  }

  return match[1].split(/\s+/);
}

/** there's no opening/closing tag or it's considered not breakable */
function isTextLikeNode(node) {
  return node.type === "text" || node.type === "comment";
}

function isScriptLikeTag(node) {
  return (
    node.type === "element" &&
    (node.fullName === "script" ||
      node.fullName === "style" ||
      node.fullName === "svg:style" ||
      (isUnknownNamespace(node) &&
        (node.name === "script" || node.name === "style")))
  );
}

function canHaveInterpolation(node) {
  return node.children && !isScriptLikeTag(node);
}

function isWhitespaceSensitiveNode(node) {
  return (
    isScriptLikeTag(node) ||
    node.type === "interpolation" ||
    isIndentationSensitiveNode(node)
  );
}

function isIndentationSensitiveNode(node) {
  return getNodeCssStyleWhiteSpace(node).startsWith("pre");
}

function isLeadingSpaceSensitiveNode(node, options) {
  const isLeadingSpaceSensitive = _isLeadingSpaceSensitiveNode();

  if (
    isLeadingSpaceSensitive &&
    !node.prev &&
    node.parent &&
    node.parent.tagDefinition &&
    node.parent.tagDefinition.ignoreFirstLf
  ) {
    return node.type === "interpolation";
  }

  return isLeadingSpaceSensitive;

  function _isLeadingSpaceSensitiveNode() {
    if (isFrontMatterNode(node)) {
      return false;
    }

    if (
      (node.type === "text" || node.type === "interpolation") &&
      node.prev &&
      (node.prev.type === "text" || node.prev.type === "interpolation")
    ) {
      return true;
    }

    if (!node.parent || node.parent.cssDisplay === "none") {
      return false;
    }

    if (isPreLikeNode(node.parent)) {
      return true;
    }

    if (
      !node.prev &&
      (node.parent.type === "root" ||
        (isPreLikeNode(node) && node.parent) ||
        isScriptLikeTag(node.parent) ||
        isVueCustomBlock(node.parent, options) ||
        !isFirstChildLeadingSpaceSensitiveCssDisplay(node.parent.cssDisplay))
    ) {
      return false;
    }

    if (
      node.prev &&
      !isNextLeadingSpaceSensitiveCssDisplay(node.prev.cssDisplay)
    ) {
      return false;
    }

    return true;
  }
}

function isTrailingSpaceSensitiveNode(node, options) {
  if (isFrontMatterNode(node)) {
    return false;
  }

  if (
    (node.type === "text" || node.type === "interpolation") &&
    node.next &&
    (node.next.type === "text" || node.next.type === "interpolation")
  ) {
    return true;
  }

  if (!node.parent || node.parent.cssDisplay === "none") {
    return false;
  }

  if (isPreLikeNode(node.parent)) {
    return true;
  }

  if (
    !node.next &&
    (node.parent.type === "root" ||
      (isPreLikeNode(node) && node.parent) ||
      isScriptLikeTag(node.parent) ||
      isVueCustomBlock(node.parent, options) ||
      !isLastChildTrailingSpaceSensitiveCssDisplay(node.parent.cssDisplay))
  ) {
    return false;
  }

  if (
    node.next &&
    !isPrevTrailingSpaceSensitiveCssDisplay(node.next.cssDisplay)
  ) {
    return false;
  }

  return true;
}

function isDanglingSpaceSensitiveNode(node) {
  return (
    isDanglingSpaceSensitiveCssDisplay(node.cssDisplay) &&
    !isScriptLikeTag(node)
  );
}

function forceNextEmptyLine(node) {
  return (
    isFrontMatterNode(node) ||
    (node.next &&
      node.sourceSpan.end.line + 1 < node.next.sourceSpan.start.line)
  );
}

/** firstChild leadingSpaces and lastChild trailingSpaces */
function forceBreakContent(node) {
  return (
    forceBreakChildren(node) ||
    (node.type === "element" &&
      node.children.length !== 0 &&
      (["body", "script", "style"].includes(node.name) ||
        node.children.some((child) => hasNonTextChild(child)))) ||
    (node.firstChild &&
      node.firstChild === node.lastChild &&
      hasLeadingLineBreak(node.firstChild) &&
      (!node.lastChild.isTrailingSpaceSensitive ||
        hasTrailingLineBreak(node.lastChild)))
  );
}

/** spaces between children */
function forceBreakChildren(node) {
  return (
    node.type === "element" &&
    node.children.length !== 0 &&
    (["html", "head", "ul", "ol", "select"].includes(node.name) ||
      (node.cssDisplay.startsWith("table") && node.cssDisplay !== "table-cell"))
  );
}

function preferHardlineAsLeadingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.prev && preferHardlineAsTrailingSpaces(node.prev)) ||
    hasSurroundingLineBreak(node)
  );
}

function preferHardlineAsTrailingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.type === "element" && node.fullName === "br") ||
    hasSurroundingLineBreak(node)
  );
}

function hasSurroundingLineBreak(node) {
  return hasLeadingLineBreak(node) && hasTrailingLineBreak(node);
}

function hasLeadingLineBreak(node) {
  return (
    node.hasLeadingSpaces &&
    (node.prev
      ? node.prev.sourceSpan.end.line < node.sourceSpan.start.line
      : node.parent.type === "root" ||
        node.parent.startSourceSpan.end.line < node.sourceSpan.start.line)
  );
}

function hasTrailingLineBreak(node) {
  return (
    node.hasTrailingSpaces &&
    (node.next
      ? node.next.sourceSpan.start.line > node.sourceSpan.end.line
      : node.parent.type === "root" ||
        (node.parent.endSourceSpan &&
          node.parent.endSourceSpan.start.line > node.sourceSpan.end.line))
  );
}

function preferHardlineAsSurroundingSpaces(node) {
  switch (node.type) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "element":
      return ["script", "select"].includes(node.name);
  }
  return false;
}

function getLastDescendant(node) {
  return node.lastChild ? getLastDescendant(node.lastChild) : node;
}

function hasNonTextChild(node) {
  return node.children && node.children.some((child) => child.type !== "text");
}

function _inferScriptParser(node) {
  const { type, lang } = node.attrMap;
  if (
    type === "module" ||
    type === "text/javascript" ||
    type === "text/babel" ||
    type === "application/javascript" ||
    lang === "jsx"
  ) {
    return "babel";
  }

  if (type === "application/x-typescript" || lang === "ts" || lang === "tsx") {
    return "typescript";
  }

  if (type === "text/markdown") {
    return "markdown";
  }

  if (type === "text/html") {
    return "html";
  }

  if (type && (type.endsWith("json") || type.endsWith("importmap"))) {
    return "json";
  }

  if (type === "text/x-handlebars-template") {
    return "glimmer";
  }
}

function inferStyleParser(node) {
  const { lang } = node.attrMap;
  if (lang === "postcss" || lang === "css") {
    return "css";
  }

  if (lang === "scss") {
    return "scss";
  }

  if (lang === "less") {
    return "less";
  }
}

function inferScriptParser(node, options) {
  if (node.name === "script" && !node.attrMap.src) {
    if (!node.attrMap.lang && !node.attrMap.type) {
      return "babel";
    }
    return _inferScriptParser(node);
  }

  if (node.name === "style") {
    return inferStyleParser(node) || "css";
  }

  if (options && isVueNonHtmlBlock(node, options)) {
    return (
      _inferScriptParser(node) ||
      inferStyleParser(node) ||
      getParserName(node.attrMap.lang, options)
    );
  }

  return null;
}

function isBlockLikeCssDisplay(cssDisplay) {
  return (
    cssDisplay === "block" ||
    cssDisplay === "list-item" ||
    cssDisplay.startsWith("table")
  );
}

function isFirstChildLeadingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
}

function isLastChildTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
}

function isPrevTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isNextLeadingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isDanglingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
}

function isPreLikeNode(node) {
  return getNodeCssStyleWhiteSpace(node).startsWith("pre");
}

function countParents(path, predicate = () => true) {
  let counter = 0;
  for (let i = path.stack.length - 1; i >= 0; i--) {
    const value = path.stack[i];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      predicate(value)
    ) {
      counter++;
    }
  }
  return counter;
}

function hasParent(node, fn) {
  let current = node;

  while (current) {
    if (fn(current)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function getNodeCssStyleDisplay(node, options) {
  if (node.prev && node.prev.type === "comment") {
    // <!-- display: block -->
    const match = node.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/);
    if (match) {
      return match[1];
    }
  }

  let isInSvgForeignObject = false;
  if (node.type === "element" && node.namespace === "svg") {
    if (hasParent(node, (parent) => parent.fullName === "svg:foreignObject")) {
      isInSvgForeignObject = true;
    } else {
      return node.name === "svg" ? "inline-block" : "block";
    }
  }

  switch (options.htmlWhitespaceSensitivity) {
    case "strict":
      return "inline";
    case "ignore":
      return "block";
    default: {
      // See https://github.com/prettier/prettier/issues/8151
      if (
        options.parser === "vue" &&
        node.parent &&
        node.parent.type === "root"
      ) {
        return "block";
      }
      return (
        (node.type === "element" &&
          (!node.namespace ||
            isInSvgForeignObject ||
            isUnknownNamespace(node)) &&
          CSS_DISPLAY_TAGS[node.name]) ||
        CSS_DISPLAY_DEFAULT
      );
    }
  }
}

function isUnknownNamespace(node) {
  return (
    node.type === "element" &&
    !node.hasExplicitNamespace &&
    !["html", "svg"].includes(node.namespace)
  );
}

function getNodeCssStyleWhiteSpace(node) {
  return (
    (node.type === "element" &&
      (!node.namespace || isUnknownNamespace(node)) &&
      CSS_WHITE_SPACE_TAGS[node.name]) ||
    CSS_WHITE_SPACE_DEFAULT
  );
}

function getMinIndentation(text) {
  let minIndentation = Infinity;

  for (const lineText of text.split("\n")) {
    if (lineText.length === 0) {
      continue;
    }

    if (!HTML_WHITESPACE.has(lineText[0])) {
      return 0;
    }

    const indentation = getLeadingHtmlWhitespace(lineText).length;

    if (lineText.length === indentation) {
      continue;
    }

    if (indentation < minIndentation) {
      minIndentation = indentation;
    }
  }

  return minIndentation === Infinity ? 0 : minIndentation;
}

function dedentString(text, minIndent = getMinIndentation(text)) {
  return minIndent === 0
    ? text
    : text
        .split("\n")
        .map((lineText) => lineText.slice(minIndent))
        .join("\n");
}

function identity(x) {
  return x;
}

function shouldNotPrintClosingTag(node, options) {
  return (
    !node.isSelfClosing &&
    !node.endSourceSpan &&
    (hasPrettierIgnore(node) || shouldPreserveContent(node.parent, options))
  );
}

function countChars(text, char) {
  let counter = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === char) {
      counter++;
    }
  }
  return counter;
}

function unescapeQuoteEntities(text) {
  return text.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

// top-level elements (excluding <template>, <style> and <script>) in Vue SFC are considered custom block
// See https://vue-loader.vuejs.org/spec.html for detail
const vueRootElementsSet = new Set(["template", "style", "script"]);
function isVueCustomBlock(node, options) {
  return isVueSfcBlock(node, options) && !vueRootElementsSet.has(node.fullName);
}

function isVueSfcBlock(node, options) {
  return (
    options.parser === "vue" &&
    node.type === "element" &&
    node.parent.type === "root" &&
    node.fullName.toLowerCase() !== "html"
  );
}

function isVueNonHtmlBlock(node, options) {
  return (
    isVueSfcBlock(node, options) &&
    (isVueCustomBlock(node, options) ||
      (node.attrMap.lang && node.attrMap.lang !== "html"))
  );
}

module.exports = {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  htmlTrim,
  htmlTrimPreserveIndentation,
  splitByHtmlWhitespace,
  hasHtmlWhitespace,
  getLeadingAndTrailingHtmlWhitespace,
  canHaveInterpolation,
  countChars,
  countParents,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getLastDescendant,
  getNodeCssStyleDisplay,
  getNodeCssStyleWhiteSpace,
  getPrettierIgnoreAttributeCommentData,
  hasPrettierIgnore,
  identity,
  inferScriptParser,
  isVueCustomBlock,
  isVueNonHtmlBlock,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isPreLikeNode,
  isScriptLikeTag,
  isTextLikeNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
  isUnknownNamespace,
  preferHardlineAsLeadingSpaces,
  preferHardlineAsTrailingSpaces,
  shouldNotPrintClosingTag,
  shouldPreserveContent,
  unescapeQuoteEntities,
};
