"use strict";

const clean = require("./clean");
const {
  builders,
  utils: { stripTrailingHardline, mapDoc, normalizeParts },
} = require("../document");
const {
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
  markAsRoot,
  softline,
} = builders;
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
  isScriptLikeTag,
  isTextLikeNode,
  preferHardlineAsLeadingSpaces,
  shouldNotPrintClosingTag,
  shouldPreserveContent,
  unescapeQuoteEntities,
} = require("./utils");
const { replaceEndOfLineWith } = require("../common/util");
const preprocess = require("./preprocess");
const assert = require("assert");
const { insertPragma } = require("./pragma");
const {
  printVueFor,
  printVueSlotScope,
  isVueEventBindingExpression,
} = require("./syntax-vue");
const { printImgSrcset, printClassNames } = require("./syntax-attribute");

function concat(parts) {
  const newParts = normalizeParts(parts);
  return newParts.length === 0
    ? ""
    : newParts.length === 1
    ? newParts[0]
    : builders.concat(newParts);
}

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "element": {
      if (isScriptLikeTag(node) || node.type === "interpolation") {
        // Fall through to "text"
        return;
      }

      if (isVueNonHtmlBlock(node, options)) {
        const parser = inferScriptParser(node, options);
        if (!parser) {
          return;
        }

        let doc;
        try {
          doc = textToDoc(
            htmlTrimPreserveIndentation(getNodeContent(node, options)),
            { parser }
          );
        } catch (_) {
          return;
        }

        // `textToDoc` don't throw on `production` mode
        if (!doc) {
          return;
        }

        // See https://github.com/prettier/prettier/pull/8465#issuecomment-645273859
        if (typeof doc === "string") {
          doc = doc.replace(/(?:\r?\n)*$/, "");
        }

        return concat([
          printOpeningTagPrefix(node, options),
          group(printOpeningTag(path, options, print)),
          concat([hardline, stripTrailingHardline(doc, true), hardline]),
          printClosingTag(node, options),
          printClosingTagSuffix(node, options),
        ]);
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
          return builders.concat([
            concat([
              breakParent,
              printOpeningTagPrefix(node, options),
              stripTrailingHardline(textToDoc(value, textToDocOptions)),
              printClosingTagSuffix(node, options),
            ]),
          ]);
        }
      } else if (node.parent.type === "interpolation") {
        return concat([
          indent(
            concat([
              line,
              textToDoc(node.value, {
                __isInHtmlInterpolation: true, // to avoid unexpected `}}`
                ...(options.parser === "angular"
                  ? { parser: "__ng_interpolation", trailingComma: "none" }
                  : options.parser === "vue"
                  ? { parser: "__vue_expression" }
                  : { parser: "__js_expression" }),
              }),
            ])
          ),
          node.parent.next &&
          needsToBorrowPrevClosingTagEndMarker(node.parent.next)
            ? " "
            : line,
        ]);
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
        return concat([node.rawName, "=", node.value]);
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
          return concat([node.rawName, "=", node.value]);
        }
      }

      const embeddedAttributeValueDoc = printEmbeddedAttributeValue(
        node,
        (code, opts) =>
          // strictly prefer single quote to avoid unnecessary html entity escape
          textToDoc(code, { __isInHtmlAttribute: true, ...opts }),
        options
      );
      if (embeddedAttributeValueDoc) {
        return concat([
          node.rawName,
          '="',
          group(
            mapDoc(embeddedAttributeValueDoc, (doc) =>
              typeof doc === "string" ? doc.replace(/"/g, "&quot;") : doc
            )
          ),
          '"',
        ]);
      }
      break;
    }
    case "front-matter":
      if (node.lang === "yaml") {
        return markAsRoot(
          concat([
            "---",
            hardline,
            node.value.trim().length === 0
              ? ""
              : textToDoc(node.value, { parser: "yaml" }),
            "---",
          ])
        );
      }
  }
}

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "front-matter":
      return concat(replaceEndOfLineWith(node.raw, literalline));
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      // use original concat to not break stripTrailingHardline
      return builders.concat([
        group(printChildren(path, options, print)),
        hardline,
      ]);
    case "element":
    case "ieConditionalComment": {
      if (shouldPreserveContent(node, options)) {
        return concat(
          [].concat(
            printOpeningTagPrefix(node, options),
            group(printOpeningTag(path, options, print)),
            replaceEndOfLineWith(getNodeContent(node, options), literalline),
            printClosingTag(node, options),
            printClosingTagSuffix(node, options)
          )
        );
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
      return concat([
        group(
          concat([
            group(printOpeningTag(path, options, print), { id: attrGroupId }),
            node.children.length === 0
              ? node.hasDanglingSpaces && node.isDanglingSpaceSensitive
                ? line
                : ""
              : concat([
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
                      : indent(childrenDoc))(
                    concat([
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
                    ])
                  ),
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
                ]),
          ])
        ),
        printClosingTag(node, options),
      ]);
    }
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return concat([printOpeningTagStart(node), printClosingTagEnd(node)]);
    case "interpolation":
      return concat([
        printOpeningTagStart(node, options),
        concat(path.map(print, "children")),
        printClosingTagEnd(node, options),
      ]);
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*?$/;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return concat([
          concat(replaceEndOfLineWith(value, literalline)),
          hasTrailingNewline ? hardline : "",
        ]);
      }
      return fill(
        normalizeParts(
          [].concat(
            printOpeningTagPrefix(node, options),
            getTextValueParts(node),
            printClosingTagSuffix(node, options)
          )
        )
      );
    }
    case "docType":
      return concat([
        group(
          concat([
            printOpeningTagStart(node, options),
            " ",
            node.value.replace(/^html\b/i, "html").replace(/\s+/g, " "),
          ])
        ),
        printClosingTagEnd(node, options),
      ]);
    case "comment": {
      return concat([
        printOpeningTagPrefix(node, options),
        concat(
          replaceEndOfLineWith(
            options.originalText.slice(
              options.locStart(node),
              options.locEnd(node)
            ),
            literalline
          )
        ),
        printClosingTagSuffix(node, options),
      ]);
    }
    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const singleQuoteCount = countChars(value, "'");
      const doubleQuoteCount = countChars(value, '"');
      const quote = singleQuoteCount < doubleQuoteCount ? "'" : '"';
      return concat([
        node.rawName,
        concat([
          "=",
          quote,
          concat(
            replaceEndOfLineWith(
              quote === '"'
                ? value.replace(/"/g, "&quot;")
                : value.replace(/'/g, "&apos;"),
              literalline
            )
          ),
          quote,
        ]),
      ]);
    }
    case "yaml":
    case "toml":
      return concat(replaceEndOfLineWith(node.raw, literalline));
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return concat([
      breakParent,
      concat(
        path.map((childPath) => {
          const childNode = childPath.getValue();
          const prevBetweenLine = !childNode.prev
            ? ""
            : printBetweenLine(childNode.prev, childNode);
          return concat([
            !prevBetweenLine
              ? ""
              : concat([
                  prevBetweenLine,
                  forceNextEmptyLine(childNode.prev) ? hardline : "",
                ]),
            printChild(childPath),
          ]);
        }, "children")
      ),
    ]);
  }

  const groupIds = node.children.map(() => Symbol(""));
  return concat(
    path.map((childPath, childIndex) => {
      const childNode = childPath.getValue();

      if (isTextLikeNode(childNode)) {
        if (childNode.prev && isTextLikeNode(childNode.prev)) {
          const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
          if (prevBetweenLine) {
            if (forceNextEmptyLine(childNode.prev)) {
              return concat([hardline, hardline, printChild(childPath)]);
            }
            return concat([prevBetweenLine, printChild(childPath)]);
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
        } else {
          if (isTextLikeNode(childNode.prev)) {
            leadingParts.push(prevBetweenLine);
          } else {
            leadingParts.push(
              ifBreak("", softline, {
                groupId: groupIds[childIndex - 1],
              })
            );
          }
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

      return concat(
        [].concat(
          prevParts,
          group(
            concat([
              concat(leadingParts),
              group(concat([printChild(childPath), concat(trailingParts)]), {
                id: groupIds[childIndex],
              }),
            ])
          ),
          nextParts
        )
      );
    }, "children")
  );

  function printChild(childPath) {
    const child = childPath.getValue();

    if (hasPrettierIgnore(child)) {
      return concat(
        [].concat(
          printOpeningTagPrefix(child, options),
          replaceEndOfLineWith(
            options.originalText.slice(
              options.locStart(child) +
                (child.prev &&
                needsToBorrowNextOpeningTagStartMarker(child.prev)
                  ? printOpeningTagStartMarker(child).length
                  : 0),
              options.locEnd(child) -
                (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
                  ? printClosingTagEndMarker(child, options).length
                  : 0)
            ),
            literalline
          ),
          printClosingTagSuffix(child, options)
        )
      );
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
            (nextNode.type === "element" && nextNode.attrs.length !== 0))) ||
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
  return options.originalText.slice(
    node.startSourceSpan.end.offset +
      (node.firstChild &&
      needsToBorrowParentOpeningTagEndMarker(node.firstChild)
        ? -printOpeningTagEndMarker(node).length
        : 0),
    node.endSourceSpan.start.offset +
      (node.lastChild &&
      needsToBorrowParentClosingTagStartMarker(node.lastChild)
        ? printClosingTagStartMarker(node, options).length
        : needsToBorrowLastChildClosingTagEndMarker(node)
        ? -printClosingTagEndMarker(node.lastChild, options).length
        : 0)
  );
}

function printOpeningTag(path, options, print) {
  const node = path.getValue();
  const forceNotToBreakAttrContent =
    node.type === "element" &&
    node.fullName === "script" &&
    node.attrs.length === 1 &&
    node.attrs[0].fullName === "src" &&
    node.children.length === 0;
  return concat([
    printOpeningTagStart(node, options),
    !node.attrs || node.attrs.length === 0
      ? node.isSelfClosing
        ? /**
           *     <br />
           *        ^
           */
          " "
        : ""
      : concat([
          indent(
            concat([
              forceNotToBreakAttrContent ? " " : line,
              join(
                line,
                ((ignoreAttributeData) => {
                  const hasPrettierIgnoreAttribute =
                    typeof ignoreAttributeData === "boolean"
                      ? () => ignoreAttributeData
                      : Array.isArray(ignoreAttributeData)
                      ? (attr) => ignoreAttributeData.includes(attr.rawName)
                      : () => false;
                  return path.map((attrPath) => {
                    const attr = attrPath.getValue();
                    return hasPrettierIgnoreAttribute(attr)
                      ? concat(
                          replaceEndOfLineWith(
                            options.originalText.slice(
                              options.locStart(attr),
                              options.locEnd(attr)
                            ),
                            literalline
                          )
                        )
                      : print(attrPath);
                  }, "attrs");
                })(
                  node.prev &&
                    node.prev.type === "comment" &&
                    getPrettierIgnoreAttributeCommentData(node.prev.value)
                )
              ),
            ])
          ),
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
            needsToBorrowLastChildClosingTagEndMarker(node.parent))
            ? node.isSelfClosing
              ? " "
              : ""
            : node.isSelfClosing
            ? forceNotToBreakAttrContent
              ? " "
              : line
            : forceNotToBreakAttrContent
            ? ""
            : softline,
        ]),
    node.isSelfClosing ? "" : printOpeningTagEnd(node),
  ]);
}

function printOpeningTagStart(node, options) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : concat([
        printOpeningTagPrefix(node, options),
        printOpeningTagStartMarker(node),
      ]);
}

function printOpeningTagEnd(node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

function printClosingTag(node, options) {
  return concat([
    node.isSelfClosing ? "" : printClosingTagStart(node, options),
    printClosingTagEnd(node, options),
  ]);
}

function printClosingTagStart(node, options) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : concat([
        printClosingTagPrefix(node, options),
        printClosingTagStartMarker(node, options),
      ]);
}

function printClosingTagEnd(node, options) {
  return (
    node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent)
  )
    ? ""
    : concat([
        printClosingTagEndMarker(node, options),
        printClosingTagSuffix(node, options),
      ]);
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
    !isTextLikeNode(getLastDescendant(node.lastChild))
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
      return node.value === 'html' ? "<!doctype" : "<!DOCTYPE";
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
    : join(line, splitByHtmlWhitespace(value)).parts;
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
    group(
      concat([
        indent(concat([softline, doc])),
        canHaveTrailingWhitespace ? softline : "",
      ])
    );
  const printMaybeHug = (doc) => (shouldHug ? printHug(doc) : printExpand(doc));

  const textToDoc = (code, opts) =>
    originalTextToDoc(code, { __onHtmlBindingRoot, ...opts });

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
        textToDoc(value, {
          parser: "css",
          __isHTMLStyleAttribute: true,
        })
      );
    }
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueFor(getValue(), textToDoc);
    }

    if (node.fullName === "slot-scope") {
      return printVueSlotScope(getValue(), textToDoc);
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
        isVueEventBindingExpression(value)
          ? textToDoc(value, { parser: "__js_expression" })
          : stripTrailingHardline(
              textToDoc(value, { parser: "__vue_event_binding" })
            )
      );
    }

    if (isKeyMatched(vueExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(getValue(), { parser: "__vue_expression" })
      );
    }

    if (isKeyMatched(jsExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(getValue(), { parser: "__js_expression" })
      );
    }
  }

  if (options.parser === "angular") {
    const ngTextToDoc = (code, opts) =>
      // angular does not allow trailing comma
      textToDoc(code, { ...opts, trailingComma: "none" });

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
      value.split(interpolationRegex).forEach((part, index) => {
        if (index % 2 === 0) {
          parts.push(concat(replaceEndOfLineWith(part, literalline)));
        } else {
          try {
            parts.push(
              group(
                concat([
                  "{{",
                  indent(
                    concat([
                      line,
                      ngTextToDoc(part, {
                        parser: "__ng_interpolation",
                        __isInHtmlInterpolation: true, // to avoid unexpected `}}`
                      }),
                    ])
                  ),
                  line,
                  "}}",
                ])
              )
            );
          } catch (e) {
            parts.push(
              "{{",
              concat(replaceEndOfLineWith(part, literalline)),
              "}}"
            );
          }
        }
      });
      return group(concat(parts));
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
