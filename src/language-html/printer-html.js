"use strict";

const assert = require("assert");
const {
  builders: {
    breakParent,
    dedentToRoot,
    fill,
    group,
    hardline,
    ifBreak,
    indent,
    join,
    line,
    literalline,
    softline,
  },
  utils: { mapDoc, cleanDoc, getDocParts },
} = require("../document");
const { replaceEndOfLineWith, isNonEmptyArray } = require("../common/util");
const { print: printFrontMatter } = require("../utils/front-matter");
const clean = require("./clean");
const {
  htmlTrimPreserveIndentation,
  splitByHtmlWhitespace,
  countChars,
  countParents,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getLastDescendant,
  getPrettierIgnoreAttributeCommentData,
  hasPrettierIgnore,
  inferScriptParser,
  isVueCustomBlock,
  isVueNonHtmlBlock,
  isVueSlotAttribute,
  isVueSfcBindingsAttribute,
  isScriptLikeTag,
  isTextLikeNode,
  preferHardlineAsLeadingSpaces,
  shouldNotPrintClosingTag,
  shouldPreserveContent,
  unescapeQuoteEntities,
  isPreLikeNode,
} = require("./utils");
const preprocess = require("./print-preprocess");
const { insertPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const {
  printVueFor,
  printVueBindings,
  isVueEventBindingExpression,
} = require("./syntax-vue");
const { printImgSrcset, printClassNames } = require("./syntax-attribute");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "element": {
      if (isScriptLikeTag(node) || node.type === "interpolation") {
        // Fall through to "text"
        return;
      }

      if (!node.isSelfClosing && isVueNonHtmlBlock(node, options)) {
        const parser = inferScriptParser(node, options);
        if (!parser) {
          return;
        }

        const content = getNodeContent(node, options);
        let isEmpty = /^\s*$/.test(content);
        let doc = "";
        if (!isEmpty) {
          doc = textToDoc(
            htmlTrimPreserveIndentation(content),
            { parser },
            { stripTrailingHardline: true }
          );
          isEmpty = doc === "";
        }

        return [
          printOpeningTagPrefix(node, options),
          group(printOpeningTag(path, options, print)),
          isEmpty ? "" : hardline,
          doc,
          isEmpty ? "" : hardline,
          printClosingTag(node, options),
          printClosingTagSuffix(node, options),
        ];
      }
      break;
    }
    case "text": {
      if (isScriptLikeTag(node.parent)) {
        const parser = inferScriptParser(node.parent);
        if (parser) {
          const value =
            parser === "markdown"
              ? dedentString(node.value.replace(/^[^\S\n]*?\n/, ""))
              : node.value;
          const textToDocOptions = { parser };
          if (options.parser === "html" && parser === "babel") {
            let sourceType = "script";
            const { attrMap } = node.parent;
            if (
              attrMap &&
              (attrMap.type === "module" ||
                (attrMap.type === "text/babel" &&
                  attrMap["data-type"] === "module"))
            ) {
              sourceType = "module";
            }
            textToDocOptions.__babelSourceType = sourceType;
          }
          return [
            breakParent,
            printOpeningTagPrefix(node, options),
            textToDoc(value, textToDocOptions, {
              stripTrailingHardline: true,
            }),
            printClosingTagSuffix(node, options),
          ];
        }
      } else if (node.parent.type === "interpolation") {
        return [
          indent([
            line,
            textToDoc(
              node.value,
              {
                __isInHtmlInterpolation: true, // to avoid unexpected `}}`
                ...(options.parser === "angular"
                  ? { parser: "__ng_interpolation", trailingComma: "none" }
                  : options.parser === "vue"
                  ? { parser: "__vue_expression" }
                  : { parser: "__js_expression" }),
              },
              { stripTrailingHardline: true }
            ),
          ]),
          node.parent.next &&
          needsToBorrowPrevClosingTagEndMarker(node.parent.next)
            ? " "
            : line,
        ];
      }
      break;
    }
    case "attribute": {
      if (!node.value) {
        break;
      }

      // lit-html: html`<my-element obj=${obj}></my-element>`
      if (
        /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(
          options.originalText.slice(
            node.valueSpan.start.offset,
            node.valueSpan.end.offset
          )
        )
      ) {
        return [node.rawName, "=", node.value];
      }

      // lwc: html`<my-element data-for={value}></my-element>`
      if (options.parser === "lwc") {
        const interpolationRegex = /^{[\S\s]*}$/;
        if (
          interpolationRegex.test(
            options.originalText.slice(
              node.valueSpan.start.offset,
              node.valueSpan.end.offset
            )
          )
        ) {
          return [node.rawName, "=", node.value];
        }
      }

      const embeddedAttributeValueDoc = printEmbeddedAttributeValue(
        node,
        (code, opts) =>
          // strictly prefer single quote to avoid unnecessary html entity escape
          textToDoc(
            code,
            { __isInHtmlAttribute: true, ...opts },
            { stripTrailingHardline: true }
          ),
        options
      );
      if (embeddedAttributeValueDoc) {
        return [
          node.rawName,
          '="',
          group(
            mapDoc(embeddedAttributeValueDoc, (doc) =>
              typeof doc === "string" ? doc.replace(/"/g, "&quot;") : doc
            )
          ),
          '"',
        ];
      }
      break;
    }
    case "front-matter":
      return printFrontMatter(node, textToDoc);
  }
}

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "front-matter":
      return replaceEndOfLineWith(node.raw, literalline);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      // use original concat to not break stripTrailingHardline
      return [group(printChildren(path, options, print)), hardline];
    case "element":
    case "ieConditionalComment": {
      if (shouldPreserveContent(node, options)) {
        return [
          printOpeningTagPrefix(node, options),
          group(printOpeningTag(path, options, print)),
          ...replaceEndOfLineWith(getNodeContent(node, options), literalline),
          ...printClosingTag(node, options),
          printClosingTagSuffix(node, options),
        ];
      }
      /**
       * do not break:
       *
       *     <div>{{
       *         ~
       *       interpolation
       *     }}</div>
       *            ~
       *
       * exception: break if the opening tag breaks
       *
       *     <div
       *       long
       *           ~
       *       >{{
       *         interpolation
       *       }}</div
       *              ~
       *     >
       */
      const shouldHugContent =
        node.children.length === 1 &&
        node.firstChild.type === "interpolation" &&
        node.firstChild.isLeadingSpaceSensitive &&
        !node.firstChild.hasLeadingSpaces &&
        node.lastChild.isTrailingSpaceSensitive &&
        !node.lastChild.hasTrailingSpaces;
      const attrGroupId = Symbol("element-attr-group-id");
      return [
        group([
          group(printOpeningTag(path, options, print), { id: attrGroupId }),
          node.children.length === 0
            ? node.hasDanglingSpaces && node.isDanglingSpaceSensitive
              ? line
              : ""
            : [
                forceBreakContent(node) ? breakParent : "",
                ((childrenDoc) =>
                  shouldHugContent
                    ? ifBreak(indent(childrenDoc), childrenDoc, {
                        groupId: attrGroupId,
                      })
                    : (isScriptLikeTag(node) ||
                        isVueCustomBlock(node, options)) &&
                      node.parent.type === "root" &&
                      options.parser === "vue" &&
                      !options.vueIndentScriptAndStyle
                    ? childrenDoc
                    : indent(childrenDoc))([
                  shouldHugContent
                    ? ifBreak(softline, "", { groupId: attrGroupId })
                    : node.firstChild.hasLeadingSpaces &&
                      node.firstChild.isLeadingSpaceSensitive
                    ? line
                    : node.firstChild.type === "text" &&
                      node.isWhitespaceSensitive &&
                      node.isIndentationSensitive
                    ? dedentToRoot(softline)
                    : softline,
                  printChildren(path, options, print),
                ]),
                (
                  node.next
                    ? needsToBorrowPrevClosingTagEndMarker(node.next)
                    : needsToBorrowLastChildClosingTagEndMarker(node.parent)
                )
                  ? node.lastChild.hasTrailingSpaces &&
                    node.lastChild.isTrailingSpaceSensitive
                    ? " "
                    : ""
                  : shouldHugContent
                  ? ifBreak(softline, "", { groupId: attrGroupId })
                  : node.lastChild.hasTrailingSpaces &&
                    node.lastChild.isTrailingSpaceSensitive
                  ? line
                  : (node.lastChild.type === "comment" ||
                      (node.lastChild.type === "text" &&
                        node.isWhitespaceSensitive &&
                        node.isIndentationSensitive)) &&
                    new RegExp(
                      `\\n[\\t ]{${
                        options.tabWidth *
                        countParents(
                          path,
                          (n) => n.parent && n.parent.type !== "root"
                        )
                      }}$`
                    ).test(node.lastChild.value)
                  ? /**
                     *     <div>
                     *       <pre>
                     *         something
                     *       </pre>
                     *            ~
                     *     </div>
                     */
                    ""
                  : softline,
              ],
        ]),
        printClosingTag(node, options),
      ];
    }
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [printOpeningTagStart(node), printClosingTagEnd(node)];
    case "interpolation":
      return [
        printOpeningTagStart(node, options),
        ...path.map(print, "children"),
        printClosingTagEnd(node, options),
      ];
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*?$/;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return [
          ...replaceEndOfLineWith(value, literalline),
          hasTrailingNewline ? hardline : "",
        ];
      }

      const printed = cleanDoc([
        printOpeningTagPrefix(node, options),
        ...getTextValueParts(node),
        printClosingTagSuffix(node, options),
      ]);
      return typeof printed === "string" ? printed : fill(getDocParts(printed));
    }
    case "docType":
      return [
        group([
          printOpeningTagStart(node, options),
          " ",
          node.value.replace(/^html\b/i, "html").replace(/\s+/g, " "),
        ]),
        printClosingTagEnd(node, options),
      ];
    case "comment": {
      return [
        printOpeningTagPrefix(node, options),

        ...replaceEndOfLineWith(
          options.originalText.slice(locStart(node), locEnd(node)),
          literalline
        ),
        printClosingTagSuffix(node, options),
      ];
    }
    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const singleQuoteCount = countChars(value, "'");
      const doubleQuoteCount = countChars(value, '"');
      const quote = singleQuoteCount < doubleQuoteCount ? "'" : '"';
      return [
        node.rawName,

        "=",
        quote,

        ...replaceEndOfLineWith(
          quote === '"'
            ? value.replace(/"/g, "&quot;")
            : value.replace(/'/g, "&apos;"),
          literalline
        ),
        quote,
      ];
    }
    default:
      /* istanbul ignore next */
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return [
      breakParent,

      ...path.map((childPath) => {
        const childNode = childPath.getValue();
        const prevBetweenLine = !childNode.prev
          ? ""
          : printBetweenLine(childNode.prev, childNode);
        return [
          !prevBetweenLine
            ? ""
            : [
                prevBetweenLine,
                forceNextEmptyLine(childNode.prev) ? hardline : "",
              ],
          printChild(childPath),
        ];
      }, "children"),
    ];
  }

  const groupIds = node.children.map(() => Symbol(""));
  return path.map((childPath, childIndex) => {
    const childNode = childPath.getValue();

    if (isTextLikeNode(childNode)) {
      if (childNode.prev && isTextLikeNode(childNode.prev)) {
        const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
        if (prevBetweenLine) {
          if (forceNextEmptyLine(childNode.prev)) {
            return [hardline, hardline, printChild(childPath)];
          }
          return [prevBetweenLine, printChild(childPath)];
        }
      }
      return printChild(childPath);
    }

    const prevParts = [];
    const leadingParts = [];
    const trailingParts = [];
    const nextParts = [];

    const prevBetweenLine = childNode.prev
      ? printBetweenLine(childNode.prev, childNode)
      : "";

    const nextBetweenLine = childNode.next
      ? printBetweenLine(childNode, childNode.next)
      : "";

    if (prevBetweenLine) {
      if (forceNextEmptyLine(childNode.prev)) {
        prevParts.push(hardline, hardline);
      } else if (prevBetweenLine === hardline) {
        prevParts.push(hardline);
      } else if (isTextLikeNode(childNode.prev)) {
        leadingParts.push(prevBetweenLine);
      } else {
        leadingParts.push(
          ifBreak("", softline, {
            groupId: groupIds[childIndex - 1],
          })
        );
      }
    }

    if (nextBetweenLine) {
      if (forceNextEmptyLine(childNode)) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline, hardline);
        }
      } else if (nextBetweenLine === hardline) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline);
        }
      } else {
        trailingParts.push(nextBetweenLine);
      }
    }

    return [
      ...prevParts,
      group([
        ...leadingParts,
        group([printChild(childPath), ...trailingParts], {
          id: groupIds[childIndex],
        }),
      ]),
      ...nextParts,
    ];
  }, "children");

  function printChild(childPath) {
    const child = childPath.getValue();

    if (hasPrettierIgnore(child)) {
      return [
        printOpeningTagPrefix(child, options),
        ...replaceEndOfLineWith(
          options.originalText.slice(
            locStart(child) +
              (child.prev && needsToBorrowNextOpeningTagStartMarker(child.prev)
                ? printOpeningTagStartMarker(child).length
                : 0),
            locEnd(child) -
              (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
                ? printClosingTagEndMarker(child, options).length
                : 0)
          ),
          literalline
        ),
        printClosingTagSuffix(child, options),
      ];
    }

    return print(childPath);
  }

  function printBetweenLine(prevNode, nextNode) {
    return isTextLikeNode(prevNode) && isTextLikeNode(nextNode)
      ? prevNode.isTrailingSpaceSensitive
        ? prevNode.hasTrailingSpaces
          ? preferHardlineAsLeadingSpaces(nextNode)
            ? hardline
            : line
          : ""
        : preferHardlineAsLeadingSpaces(nextNode)
        ? hardline
        : softline
      : (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
          (hasPrettierIgnore(nextNode) ||
            /**
             *     123<a
             *          ~
             *       ><b>
             */
            nextNode.firstChild ||
            /**
             *     123<!--
             *            ~
             *     -->
             */
            nextNode.isSelfClosing ||
            /**
             *     123<span
             *             ~
             *       attr
             */
            (nextNode.type === "element" && nextNode.attrs.length > 0))) ||
        /**
         *     <img
         *       src="long"
         *                 ~
         *     />123
         */
        (prevNode.type === "element" &&
          prevNode.isSelfClosing &&
          needsToBorrowPrevClosingTagEndMarker(nextNode))
      ? ""
      : !nextNode.isLeadingSpaceSensitive ||
        preferHardlineAsLeadingSpaces(nextNode) ||
        /**
         *       Want to write us a letter? Use our<a
         *         ><b><a>mailing address</a></b></a
         *                                          ~
         *       >.
         */
        (needsToBorrowPrevClosingTagEndMarker(nextNode) &&
          prevNode.lastChild &&
          needsToBorrowParentClosingTagStartMarker(prevNode.lastChild) &&
          prevNode.lastChild.lastChild &&
          needsToBorrowParentClosingTagStartMarker(
            prevNode.lastChild.lastChild
          ))
      ? hardline
      : nextNode.hasLeadingSpaces
      ? line
      : softline;
  }
}

function getNodeContent(node, options) {
  let start = node.startSourceSpan.end.offset;
  if (
    node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
  ) {
    start -= printOpeningTagEndMarker(node).length;
  }

  let end = node.endSourceSpan.start.offset;
  if (
    node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
  ) {
    end += printClosingTagStartMarker(node, options).length;
  } else if (needsToBorrowLastChildClosingTagEndMarker(node)) {
    end -= printClosingTagEndMarker(node.lastChild, options).length;
  }

  return options.originalText.slice(start, end);
}

function printAttributes(path, options, print) {
  const node = path.getValue();

  if (!isNonEmptyArray(node.attrs)) {
    return node.isSelfClosing
      ? /**
         *     <br />
         *        ^
         */
        " "
      : "";
  }

  const ignoreAttributeData =
    node.prev &&
    node.prev.type === "comment" &&
    getPrettierIgnoreAttributeCommentData(node.prev.value);

  const hasPrettierIgnoreAttribute =
    typeof ignoreAttributeData === "boolean"
      ? () => ignoreAttributeData
      : Array.isArray(ignoreAttributeData)
      ? (attribute) => ignoreAttributeData.includes(attribute.rawName)
      : () => false;

  const printedAttributes = path.map((attributePath) => {
    const attribute = attributePath.getValue();
    return hasPrettierIgnoreAttribute(attribute)
      ? replaceEndOfLineWith(
          options.originalText.slice(locStart(attribute), locEnd(attribute)),
          literalline
        )
      : print(attributePath);
  }, "attrs");

  const forceNotToBreakAttrContent =
    node.type === "element" &&
    node.fullName === "script" &&
    node.attrs.length === 1 &&
    node.attrs[0].fullName === "src" &&
    node.children.length === 0;

  const parts = [
    indent([
      forceNotToBreakAttrContent ? " " : line,
      join(line, printedAttributes),
    ]),
  ];

  if (
    /**
     *     123<a
     *       attr
     *           ~
     *       >456
     */
    (node.firstChild &&
      needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
    /**
     *     <span
     *       >123<meta
     *                ~
     *     /></span>
     */
    (node.isSelfClosing &&
      needsToBorrowLastChildClosingTagEndMarker(node.parent)) ||
    forceNotToBreakAttrContent
  ) {
    parts.push(node.isSelfClosing ? " " : "");
  } else {
    parts.push(node.isSelfClosing ? line : softline);
  }

  return parts;
}

function printOpeningTag(path, options, print) {
  const node = path.getValue();

  return [
    printOpeningTagStart(node, options),
    printAttributes(path, options, print),
    node.isSelfClosing ? "" : printOpeningTagEnd(node),
  ];
}

function printOpeningTagStart(node, options) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : [printOpeningTagPrefix(node, options), printOpeningTagStartMarker(node)];
}

function printOpeningTagEnd(node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

function printClosingTag(node, options) {
  return [
    node.isSelfClosing ? "" : printClosingTagStart(node, options),
    printClosingTagEnd(node, options),
  ];
}

function printClosingTagStart(node, options) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : [
        printClosingTagPrefix(node, options),
        printClosingTagStartMarker(node, options),
      ];
}

function printClosingTagEnd(node, options) {
  return (
    node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent)
  )
    ? ""
    : [
        printClosingTagEndMarker(node, options),
        printClosingTagSuffix(node, options),
      ];
}

function needsToBorrowNextOpeningTagStartMarker(node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return (
    node.next &&
    !isTextLikeNode(node.next) &&
    isTextLikeNode(node) &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces
  );
}

function needsToBorrowParentOpeningTagEndMarker(node) {
  /**
   *     <p
   *       >123
   *       ^
   *
   *     <p
   *       ><a
   *       ^
   */
  return !node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function needsToBorrowPrevClosingTagEndMarker(node) {
  /**
   *     <p></p
   *     >123
   *     ^
   *
   *     <p></p
   *     ><a
   *     ^
   */
  return (
    node.prev &&
    node.prev.type !== "docType" &&
    !isTextLikeNode(node.prev) &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces
  );
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *       ></p
   *       ^
   *     >
   */
  return (
    node.lastChild &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces &&
    !isTextLikeNode(getLastDescendant(node.lastChild)) &&
    !isPreLikeNode(node)
  );
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   *
   *         123</b
   *       ></a
   *        ^^^
   *     >
   */
  return (
    !node.next &&
    !node.hasTrailingSpaces &&
    node.isTrailingSpaceSensitive &&
    isTextLikeNode(getLastDescendant(node))
  );
}

function printOpeningTagPrefix(node, options) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.prev, options)
    : "";
}

function printClosingTagPrefix(node, options) {
  return needsToBorrowLastChildClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.lastChild, options)
    : "";
}

function printClosingTagSuffix(node, options) {
  return needsToBorrowParentClosingTagStartMarker(node)
    ? printClosingTagStartMarker(node.parent, options)
    : needsToBorrowNextOpeningTagStartMarker(node)
    ? printOpeningTagStartMarker(node.next)
    : "";
}

function printOpeningTagStartMarker(node) {
  switch (node.type) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${node.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType":
      return "<!DOCTYPE";
    case "element":
      if (node.condition) {
        return `<!--[if ${node.condition}]><!--><${node.rawName}`;
      }
    // fall through
    default:
      return `<${node.rawName}`;
  }
}

function printOpeningTagEndMarker(node) {
  assert(!node.isSelfClosing);
  switch (node.type) {
    case "ieConditionalComment":
      return "]>";
    case "element":
      if (node.condition) {
        return "><!--<![endif]-->";
      }
    // fall through
    default:
      return ">";
  }
}

function printClosingTagStartMarker(node, options) {
  assert(!node.isSelfClosing);
  /* istanbul ignore next */
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.type) {
    case "ieConditionalComment":
      return "<!";
    case "element":
      if (node.hasHtmComponentClosingTag) {
        return "<//";
      }
    // fall through
    default:
      return `</${node.rawName}`;
  }
}

function printClosingTagEndMarker(node, options) {
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.type) {
    case "ieConditionalComment":
    case "ieConditionalEndComment":
      return "[endif]-->";
    case "ieConditionalStartComment":
      return "]><!-->";
    case "interpolation":
      return "}}";
    case "element":
      if (node.isSelfClosing) {
        return "/>";
      }
    // fall through
    default:
      return ">";
  }
}

function getTextValueParts(node, value = node.value) {
  return node.parent.isWhitespaceSensitive
    ? node.parent.isIndentationSensitive
      ? replaceEndOfLineWith(value, literalline)
      : replaceEndOfLineWith(
          dedentString(htmlTrimPreserveIndentation(value)),
          hardline
        )
    : getDocParts(join(line, splitByHtmlWhitespace(value)));
}

function printEmbeddedAttributeValue(node, originalTextToDoc, options) {
  const isKeyMatched = (patterns) =>
    new RegExp(patterns.join("|")).test(node.fullName);
  const getValue = () => unescapeQuoteEntities(node.value);

  let shouldHug = false;

  const __onHtmlBindingRoot = (root, options) => {
    const rootNode =
      root.type === "NGRoot"
        ? root.node.type === "NGMicrosyntax" &&
          root.node.body.length === 1 &&
          root.node.body[0].type === "NGMicrosyntaxExpression"
          ? root.node.body[0].expression
          : root.node
        : root.type === "JsExpressionRoot"
        ? root.node
        : root;
    if (
      rootNode &&
      (rootNode.type === "ObjectExpression" ||
        rootNode.type === "ArrayExpression" ||
        (options.parser === "__vue_expression" &&
          (rootNode.type === "TemplateLiteral" ||
            rootNode.type === "StringLiteral")))
    ) {
      shouldHug = true;
    }
  };

  const printHug = (doc) => group(doc);
  const printExpand = (doc, canHaveTrailingWhitespace = true) =>
    group([indent([softline, doc]), canHaveTrailingWhitespace ? softline : ""]);
  const printMaybeHug = (doc) => (shouldHug ? printHug(doc) : printExpand(doc));

  const textToDoc = (code, opts) =>
    originalTextToDoc(
      code,
      { __onHtmlBindingRoot, ...opts },
      { stripTrailingHardline: true }
    );

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return printExpand(printImgSrcset(getValue()));
  }

  if (node.fullName === "class" && !options.parentParser) {
    const value = getValue();
    if (!value.includes("{{")) {
      return printClassNames(value);
    }
  }

  if (node.fullName === "style" && !options.parentParser) {
    const value = getValue();
    if (!value.includes("{{")) {
      return printExpand(
        textToDoc(
          value,
          {
            parser: "css",
            __isHTMLStyleAttribute: true,
          },
          { stripTrailingHardline: true }
        )
      );
    }
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueFor(getValue(), textToDoc);
    }

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueBindings(getValue(), textToDoc);
    }

    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    const vueEventBindingPatterns = ["^@", "^v-on:"];
    /**
     *     :class="vueExpression"
     *     v-bind:id="vueExpression"
     */
    const vueExpressionBindingPatterns = ["^:", "^v-bind:"];
    /**
     *     v-if="jsExpression"
     */
    const jsExpressionBindingPatterns = ["^v-"];

    if (isKeyMatched(vueEventBindingPatterns)) {
      const value = getValue();
      return printMaybeHug(
        textToDoc(
          value,
          {
            parser: isVueEventBindingExpression(value)
              ? "__js_expression"
              : "__vue_event_binding",
          },
          { stripTrailingHardline: true }
        )
      );
    }

    if (isKeyMatched(vueExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(
          getValue(),
          { parser: "__vue_expression" },
          { stripTrailingHardline: true }
        )
      );
    }

    if (isKeyMatched(jsExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(
          getValue(),
          { parser: "__js_expression" },
          { stripTrailingHardline: true }
        )
      );
    }
  }

  if (options.parser === "angular") {
    const ngTextToDoc = (code, opts) =>
      // angular does not allow trailing comma
      textToDoc(
        code,
        { ...opts, trailingComma: "none" },
        { stripTrailingHardline: true }
      );

    /**
     *     *directive="angularDirective"
     */
    const ngDirectiveBindingPatterns = ["^\\*"];
    /**
     *     (click)="angularStatement"
     *     on-click="angularStatement"
     */
    const ngStatementBindingPatterns = ["^\\(.+\\)$", "^on-"];
    /**
     *     [target]="angularExpression"
     *     bind-target="angularExpression"
     *     [(target)]="angularExpression"
     *     bindon-target="angularExpression"
     */
    const ngExpressionBindingPatterns = [
      "^\\[.+\\]$",
      "^bind(on)?-",
      // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
      "^ng-(if|show|hide|class|style)$",
    ];
    /**
     *     i18n="longDescription"
     *     i18n-attr="longDescription"
     */
    const ngI18nPatterns = ["^i18n(-.+)?$"];

    if (isKeyMatched(ngStatementBindingPatterns)) {
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_action" }));
    }

    if (isKeyMatched(ngExpressionBindingPatterns)) {
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_binding" }));
    }

    if (isKeyMatched(ngI18nPatterns)) {
      const value = getValue().trim();
      return printExpand(
        fill(getTextValueParts(node, value)),
        !value.includes("@@")
      );
    }

    if (isKeyMatched(ngDirectiveBindingPatterns)) {
      return printMaybeHug(
        ngTextToDoc(getValue(), { parser: "__ng_directive" })
      );
    }

    const interpolationRegex = /{{([\S\s]+?)}}/g;
    const value = getValue();
    if (interpolationRegex.test(value)) {
      const parts = [];
      for (const [index, part] of value.split(interpolationRegex).entries()) {
        if (index % 2 === 0) {
          parts.push(replaceEndOfLineWith(part, literalline));
        } else {
          try {
            parts.push(
              group([
                "{{",
                indent([
                  line,
                  ngTextToDoc(part, {
                    parser: "__ng_interpolation",
                    __isInHtmlInterpolation: true, // to avoid unexpected `}}`
                  }),
                ]),
                line,
                "}}",
              ])
            );
          } catch (e) {
            parts.push("{{", replaceEndOfLineWith(part, literalline), "}}");
          }
        }
      }
      return group(parts);
    }
  }

  return null;
}

module.exports = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed,
};
