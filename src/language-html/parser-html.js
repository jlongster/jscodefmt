"use strict";

const parseFrontMatter = require("../utils/front-matter");
const {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  isUnknownNamespace,
} = require("./utils");
const { hasPragma } = require("./pragma");
const createError = require("../common/parser-create-error");
const { Node } = require("./ast");
const { parseIeConditionalComment } = require("./conditional-comment");
const { getParserName } = require("../common/util");

function ngHtmlParser(
  input,
  {
    recognizeSelfClosing,
    normalizeTagName,
    normalizeAttributeName,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType,
  },
  options
) {
  const parser = require("angular-html-parser");
  const {
    RecursiveVisitor,
    visitAll,
    Attribute,
    CDATA,
    Comment,
    DocType,
    Element,
    Text,
  } = require("angular-html-parser/lib/compiler/src/ml_parser/ast");
  const {
    ParseSourceSpan,
  } = require("angular-html-parser/lib/compiler/src/parse_util");
  const {
    getHtmlTagDefinition,
  } = require("angular-html-parser/lib/compiler/src/ml_parser/html_tags");

  let { rootNodes, errors } = parser.parse(input, {
    canSelfClose: recognizeSelfClosing,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType,
  });

  const isVueHtml =
    options.parser === "vue" &&
    rootNodes.some(
      (node) =>
        (node instanceof DocType && node.value === "html") ||
        (node instanceof Element && node.name.toLowerCase() === "html")
    );

  if (options.parser === "vue" && !isVueHtml) {
    const shouldParseAsHTML = (node) => {
      if (!node) {
        return false;
      }
      if (node.name !== "template") {
        return false;
      }
      const langAttr = node.attrs.find((attr) => attr.name === "lang");
      const langValue = langAttr && langAttr.value;
      return langValue == null || getParserName(langValue, options) === "html";
    };
    if (rootNodes.some(shouldParseAsHTML)) {
      let secondParseResult;
      const doSecondParse = () =>
        parser.parse(input, {
          canSelfClose: recognizeSelfClosing,
          allowHtmComponentClosingTags,
          isTagNameCaseSensitive,
        });
      const getSecondParse = () =>
        secondParseResult || (secondParseResult = doSecondParse());
      const getSameLocationNode = (node) =>
        getSecondParse().rootNodes.find(
          ({ startSourceSpan }) =>
            startSourceSpan &&
            startSourceSpan.start.offset === node.startSourceSpan.start.offset
        );
      for (let i = 0; i < rootNodes.length; i++) {
        const node = rootNodes[i];
        const { endSourceSpan, startSourceSpan } = node;
        const isUnclosedNode = endSourceSpan === null;
        if (isUnclosedNode) {
          const result = getSecondParse();
          errors = result.errors;
          rootNodes[i] = getSameLocationNode(node) || node;
        } else if (shouldParseAsHTML(node)) {
          const result = getSecondParse();
          const startOffset = startSourceSpan.end.offset;
          const endOffset = endSourceSpan.start.offset;
          for (const error of result.errors) {
            const { offset } = error.span.start;
            if (startOffset < offset && offset < endOffset) {
              errors = [error];
              break;
            }
          }
          rootNodes[i] = getSameLocationNode(node) || node;
        }
      }
    }
  } else if (isVueHtml) {
    // If not Vue SFC, treat as html
    recognizeSelfClosing = true;
    normalizeTagName = true;
    normalizeAttributeName = true;
    allowHtmComponentClosingTags = true;
    isTagNameCaseSensitive = false;
    const htmlParseResult = parser.parse(input, {
      canSelfClose: recognizeSelfClosing,
      allowHtmComponentClosingTags,
      isTagNameCaseSensitive,
    });

    rootNodes = htmlParseResult.rootNodes;
    errors = htmlParseResult.errors;
  }

  if (errors.length !== 0) {
    const { msg, span } = errors[0];
    const { line, col } = span.start;
    throw createError(msg, { start: { line: line + 1, column: col + 1 } });
  }

  const addType = (node) => {
    if (node instanceof Attribute) {
      node.type = "attribute";
    } else if (node instanceof CDATA) {
      node.type = "cdata";
    } else if (node instanceof Comment) {
      node.type = "comment";
    } else if (node instanceof DocType) {
      node.type = "docType";
    } else if (node instanceof Element) {
      node.type = "element";
    } else if (node instanceof Text) {
      node.type = "text";
    } else {
      throw new Error(`Unexpected node ${JSON.stringify(node)}`);
    }
  };

  const restoreName = (node) => {
    const namespace = node.name.startsWith(":")
      ? node.name.slice(1).split(":")[0]
      : null;
    const rawName = node.nameSpan.toString();
    const hasExplicitNamespace = rawName.startsWith(`${namespace}:`);
    const name = hasExplicitNamespace
      ? rawName.slice(namespace.length + 1)
      : rawName;

    node.name = name;
    node.namespace = namespace;
    node.hasExplicitNamespace = hasExplicitNamespace;
  };

  const restoreNameAndValue = (node) => {
    if (node instanceof Element) {
      restoreName(node);
      node.attrs.forEach((attr) => {
        restoreName(attr);
        if (!attr.valueSpan) {
          attr.value = null;
        } else {
          attr.value = attr.valueSpan.toString();
          if (/["']/.test(attr.value[0])) {
            attr.value = attr.value.slice(1, -1);
          }
        }
      });
    } else if (node instanceof Comment) {
      node.value = node.sourceSpan
        .toString()
        .slice("<!--".length, -"-->".length);
    } else if (node instanceof Text) {
      node.value = node.sourceSpan.toString();
    }
  };

  const lowerCaseIfFn = (text, fn) => {
    const lowerCasedText = text.toLowerCase();
    return fn(lowerCasedText) ? lowerCasedText : text;
  };
  const normalizeName = (node) => {
    if (node instanceof Element) {
      if (
        normalizeTagName &&
        (!node.namespace ||
          node.namespace === node.tagDefinition.implicitNamespacePrefix ||
          isUnknownNamespace(node))
      ) {
        node.name = lowerCaseIfFn(
          node.name,
          (lowerCasedName) => lowerCasedName in HTML_TAGS
        );
      }

      if (normalizeAttributeName) {
        const CURRENT_HTML_ELEMENT_ATTRIBUTES =
          HTML_ELEMENT_ATTRIBUTES[node.name] || Object.create(null);
        node.attrs.forEach((attr) => {
          if (!attr.namespace) {
            attr.name = lowerCaseIfFn(
              attr.name,
              (lowerCasedAttrName) =>
                node.name in HTML_ELEMENT_ATTRIBUTES &&
                (lowerCasedAttrName in HTML_ELEMENT_ATTRIBUTES["*"] ||
                  lowerCasedAttrName in CURRENT_HTML_ELEMENT_ATTRIBUTES)
            );
          }
        });
      }
    }
  };

  const fixSourceSpan = (node) => {
    if (node.sourceSpan && node.endSourceSpan) {
      node.sourceSpan = new ParseSourceSpan(
        node.sourceSpan.start,
        node.endSourceSpan.end
      );
    }
  };

  const addTagDefinition = (node) => {
    if (node instanceof Element) {
      const tagDefinition = getHtmlTagDefinition(
        isTagNameCaseSensitive ? node.name : node.name.toLowerCase()
      );
      if (
        !node.namespace ||
        node.namespace === tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node)
      ) {
        node.tagDefinition = tagDefinition;
      } else {
        node.tagDefinition = getHtmlTagDefinition(""); // the default one
      }
    }
  };

  visitAll(
    new (class extends RecursiveVisitor {
      visit(node) {
        addType(node);
        restoreNameAndValue(node);
        addTagDefinition(node);
        normalizeName(node);
        fixSourceSpan(node);
      }
    })(),
    rootNodes
  );

  return rootNodes;
}

function _parse(text, options, parserOptions, shouldParseFrontMatter = true) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const rawAst = {
    type: "root",
    sourceSpan: { start: { offset: 0 }, end: { offset: text.length } },
    children: ngHtmlParser(content, parserOptions, options),
  };

  if (frontMatter) {
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  const parseSubHtml = (subContent, startSpan) => {
    const { offset } = startSpan;
    const fakeContent = text.slice(0, offset).replace(/[^\n\r]/g, " ");
    const realContent = subContent;
    const subAst = _parse(
      fakeContent + realContent,
      options,
      parserOptions,
      false
    );
    const ParseSourceSpan = subAst.children[0].sourceSpan.constructor;
    subAst.sourceSpan = new ParseSourceSpan(
      startSpan,
      subAst.children[subAst.children.length - 1].sourceSpan.end
    );
    const firstText = subAst.children[0];
    if (firstText.length === offset) {
      subAst.children.shift();
    } else {
      firstText.sourceSpan = new ParseSourceSpan(
        firstText.sourceSpan.start.moveBy(offset),
        firstText.sourceSpan.end
      );
      firstText.value = firstText.value.slice(offset);
    }
    return subAst;
  };

  return ast.map((node) => {
    if (node.type === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml
      );
      if (ieConditionalComment) {
        return ieConditionalComment;
      }
    }

    return node;
  });
}

function locStart(node) {
  return node.sourceSpan.start.offset;
}

function locEnd(node) {
  return node.sourceSpan.end.offset;
}

function createParser({
  recognizeSelfClosing = false,
  normalizeTagName = false,
  normalizeAttributeName = false,
  allowHtmComponentClosingTags = false,
  isTagNameCaseSensitive = false,
  getTagContentType,
} = {}) {
  return {
    parse: (text, parsers, options) =>
      _parse(text, options, {
        recognizeSelfClosing,
        normalizeTagName,
        normalizeAttributeName,
        allowHtmComponentClosingTags,
        isTagNameCaseSensitive,
        getTagContentType,
      }),
    hasPragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

module.exports = {
  parsers: {
    html: createParser({
      recognizeSelfClosing: true,
      normalizeTagName: true,
      normalizeAttributeName: true,
      allowHtmComponentClosingTags: true,
    }),
    angular: createParser(),
    vue: createParser({
      recognizeSelfClosing: true,
      isTagNameCaseSensitive: true,
      getTagContentType: (tagName, prefix, hasParent, attrs) => {
        if (
          tagName.toLowerCase() !== "html" &&
          !hasParent &&
          (tagName !== "template" ||
            attrs.some(
              ({ name, value }) => name === "lang" && value !== "html"
            ))
        ) {
          return require("angular-html-parser").TagContentType.RAW_TEXT;
        }
      },
    }),
    lwc: createParser(),
  },
};
