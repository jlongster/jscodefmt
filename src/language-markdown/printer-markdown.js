"use strict";

const privateUtil = require("../common/util");
const embed = require("./embed");
const pragma = require("./pragma");
const preprocess = require("./preprocess");
const {
  builders: {
    breakParent,
    concat,
    join,
    line,
    literalline,
    markAsRoot,
    hardline,
    softline,
    ifBreak,
    fill,
    align,
    indent,
    group,
  },
  utils: { normalizeDoc },
  printer: { printDocToString },
} = require("../document");
const {
  getFencedCodeBlockValue,
  hasGitDiffFriendlyOrderedList,
  splitText,
  punctuationPattern,
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
} = require("./utils");
const { replaceEndOfLineWith, isFrontMatterNode } = require("../common/util");

const TRAILING_HARDLINE_NODES = new Set(["importExport"]);
const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "link"];
const SIBLING_NODE_TYPES = new Set([
  "listItem",
  "definition",
  "footnoteDefinition",
]);

function genericPrint(path, options, print) {
  const node = path.getValue();

  if (shouldRemainTheSameContent(path)) {
    return concat(
      splitText(
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset
        ),
        options
      ).map((node) =>
        node.type === "word"
          ? node.value
          : node.value === ""
          ? ""
          : printLine(path, node.value, options)
      )
    );
  }

  switch (node.type) {
    case "front-matter":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "root":
      if (node.children.length === 0) {
        return "";
      }
      return concat([
        normalizeDoc(printRoot(path, options, print)),
        !TRAILING_HARDLINE_NODES.has(getLastDescendantNode(node).type)
          ? hardline
          : "",
      ]);
    case "paragraph":
      return printChildren(path, options, print, {
        postprocessor: fill,
      });
    case "sentence":
      return printChildren(path, options, print);
    case "word":
      return node.value
        .replace(/[$*]/g, "\\$&") // escape all `*` and `$` (math)
        .replace(
          new RegExp(
            [
              `(^|${punctuationPattern})(_+)`,
              `(_+)(${punctuationPattern}|$)`,
            ].join("|"),
            "g"
          ),
          (_, text1, underscore1, underscore2, text2) =>
            (underscore1
              ? `${text1}${underscore1}`
              : `${underscore2}${text2}`
            ).replace(/_/g, "\\_")
        ); // escape all `_` except concating with non-punctuation, e.g. `1_2_3` is not considered emphasis
    case "whitespace": {
      const parentNode = path.getParentNode();
      const index = parentNode.children.indexOf(node);
      const nextNode = parentNode.children[index + 1];

      const proseWrap =
        // leading char that may cause different syntax
        nextNode && /^>|^([*+-]|#{1,6}|\d+[).])$/.test(nextNode.value)
          ? "never"
          : options.proseWrap;

      return printLine(path, node.value, { proseWrap });
    }
    case "emphasis": {
      const parentNode = path.getParentNode();
      const index = parentNode.children.indexOf(node);
      const prevNode = parentNode.children[index - 1];
      const nextNode = parentNode.children[index + 1];
      const hasPrevOrNextWord = // `1*2*3` is considered emphasis but `1_2_3` is not
        (prevNode &&
          prevNode.type === "sentence" &&
          prevNode.children.length > 0 &&
          privateUtil.getLast(prevNode.children).type === "word" &&
          !privateUtil.getLast(prevNode.children).hasTrailingPunctuation) ||
        (nextNode &&
          nextNode.type === "sentence" &&
          nextNode.children.length > 0 &&
          nextNode.children[0].type === "word" &&
          !nextNode.children[0].hasLeadingPunctuation);
      const style =
        hasPrevOrNextWord || getAncestorNode(path, "emphasis") ? "*" : "_";
      return concat([style, printChildren(path, options, print), style]);
    }
    case "strong":
      return concat(["**", printChildren(path, options, print), "**"]);
    case "delete":
      return concat(["~~", printChildren(path, options, print), "~~"]);
    case "inlineCode": {
      const backtickCount = privateUtil.getMinNotPresentContinuousCount(
        node.value,
        "`"
      );
      const style = "`".repeat(backtickCount || 1);
      const gap = backtickCount ? " " : "";
      return concat([style, gap, node.value, gap, style]);
    }
    case "link":
      switch (options.originalText[node.position.start.offset]) {
        case "<": {
          const mailto = "mailto:";
          const url =
            // <hello@example.com> is parsed as { url: "mailto:hello@example.com" }
            node.url.startsWith(mailto) &&
            options.originalText.slice(
              node.position.start.offset + 1,
              node.position.start.offset + 1 + mailto.length
            ) !== mailto
              ? node.url.slice(mailto.length)
              : node.url;
          return concat(["<", url, ">"]);
        }
        case "[":
          return concat([
            "[",
            printChildren(path, options, print),
            "](",
            printUrl(node.url, ")"),
            printTitle(node.title, options),
            ")",
          ]);
        default:
          return options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset
          );
      }
    case "image":
      return concat([
        "![",
        node.alt || "",
        "](",
        printUrl(node.url, ")"),
        printTitle(node.title, options),
        ")",
      ]);
    case "blockquote":
      return concat(["> ", align("> ", printChildren(path, options, print))]);
    case "heading":
      return concat([
        "#".repeat(node.depth) + " ",
        printChildren(path, options, print),
      ]);
    case "code": {
      if (node.isIndented) {
        // indented code block
        const alignment = " ".repeat(4);
        return align(
          alignment,
          concat([
            alignment,
            concat(replaceEndOfLineWith(node.value, hardline)),
          ])
        );
      }

      // fenced code block
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(
          3,
          privateUtil.getMaxContinuousCount(node.value, styleUnit) + 1
        )
      );
      return concat([
        style,
        node.lang || "",
        hardline,
        concat(
          replaceEndOfLineWith(
            getFencedCodeBlockValue(node, options.originalText),
            hardline
          )
        ),
        hardline,
        style,
      ]);
    }
    case "yaml":
    case "toml":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "html": {
      const parentNode = path.getParentNode();
      const value =
        parentNode.type === "root" &&
        privateUtil.getLast(parentNode.children) === node
          ? node.value.trimEnd()
          : node.value;
      const isHtmlComment = /^<!--[\S\s]*-->$/.test(value);
      return concat(
        replaceEndOfLineWith(
          value,
          isHtmlComment ? hardline : markAsRoot(literalline)
        )
      );
    }
    case "list": {
      const nthSiblingIndex = getNthListSiblingIndex(
        node,
        path.getParentNode()
      );

      const isGitDiffFriendlyOrderedList = hasGitDiffFriendlyOrderedList(
        node,
        options
      );

      return printChildren(path, options, print, {
        processor: (childPath, index) => {
          const prefix = getPrefix();
          const childNode = childPath.getValue();

          if (
            childNode.children.length === 2 &&
            childNode.children[1].type === "html" &&
            childNode.children[0].position.start.column !==
              childNode.children[1].position.start.column
          ) {
            return concat([
              prefix,
              printListItem(childPath, options, print, prefix),
            ]);
          }

          return concat([
            prefix,
            align(
              " ".repeat(prefix.length),
              printListItem(childPath, options, print, prefix)
            ),
          ]);

          function getPrefix() {
            const rawPrefix = node.ordered
              ? (index === 0
                  ? node.start
                  : isGitDiffFriendlyOrderedList
                  ? 1
                  : node.start + index) +
                (nthSiblingIndex % 2 === 0 ? ". " : ") ")
              : nthSiblingIndex % 2 === 0
              ? "- "
              : "* ";

            return node.isAligned ||
              /* workaround for https://github.com/remarkjs/remark/issues/315 */ node.hasIndentedCodeblock
              ? alignListPrefix(rawPrefix, options)
              : rawPrefix;
          }
        },
      });
    }
    case "thematicBreak": {
      const counter = getAncestorCounter(path, "list");
      if (counter === -1) {
        return "---";
      }
      const nthSiblingIndex = getNthListSiblingIndex(
        path.getParentNode(counter),
        path.getParentNode(counter + 1)
      );
      return nthSiblingIndex % 2 === 0 ? "***" : "---";
    }
    case "linkReference":
      return concat([
        "[",
        printChildren(path, options, print),
        "]",
        node.referenceType === "full"
          ? concat(["[", node.identifier, "]"])
          : node.referenceType === "collapsed"
          ? "[]"
          : "",
      ]);
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return concat(["![", node.alt || "", "][", node.identifier, "]"]);
        default:
          return concat([
            "![",
            node.alt,
            "]",
            node.referenceType === "collapsed" ? "[]" : "",
          ]);
      }
    case "definition": {
      const lineOrSpace = options.proseWrap === "always" ? line : " ";
      return group(
        concat([
          concat(["[", node.identifier, "]:"]),
          indent(
            concat([
              lineOrSpace,
              printUrl(node.url),
              node.title === null
                ? ""
                : concat([lineOrSpace, printTitle(node.title, options, false)]),
            ])
          ),
        ])
      );
    }
    case "footnote":
      return concat(["[^", printChildren(path, options, print), "]"]);
    case "footnoteReference":
      return concat(["[^", node.identifier, "]"]);
    case "footnoteDefinition": {
      const nextNode = path.getParentNode().children[path.getName() + 1];
      const shouldInlineFootnote =
        node.children.length === 1 &&
        node.children[0].type === "paragraph" &&
        (options.proseWrap === "never" ||
          (options.proseWrap === "preserve" &&
            node.children[0].position.start.line ===
              node.children[0].position.end.line));
      return concat([
        "[^",
        node.identifier,
        "]: ",
        shouldInlineFootnote
          ? printChildren(path, options, print)
          : group(
              concat([
                align(
                  " ".repeat(options.tabWidth),
                  printChildren(path, options, print, {
                    processor: (childPath, index) => {
                      return index === 0
                        ? group(concat([softline, childPath.call(print)]))
                        : childPath.call(print);
                    },
                  })
                ),
                nextNode && nextNode.type === "footnoteDefinition"
                  ? softline
                  : "",
              ])
            ),
      ]);
    }
    case "table":
      return printTable(path, options, print);
    case "tableCell":
      return printChildren(path, options, print);
    case "break":
      return /\s/.test(options.originalText[node.position.start.offset])
        ? concat(["  ", markAsRoot(literalline)])
        : concat(["\\", hardline]);
    case "liquidNode":
      return concat(replaceEndOfLineWith(node.value, hardline));
    // MDX
    case "importExport":
    case "jsx":
      return node.value; // fallback to the original text if multiparser failed
    case "math":
      return concat([
        "$$",
        hardline,
        node.value
          ? concat([
              concat(replaceEndOfLineWith(node.value, hardline)),
              hardline,
            ])
          : "",
        "$$",
      ]);
    case "inlineMath": {
      // remark-math trims content but we don't want to remove whitespaces
      // since it's very possible that it's recognized as math accidentally
      return options.originalText.slice(
        options.locStart(node),
        options.locEnd(node)
      );
    }

    case "tableRow": // handled in "table"
    case "listItem": // handled in "list"
    default:
      throw new Error(`Unknown markdown type ${JSON.stringify(node.type)}`);
  }
}

function printListItem(path, options, print, listPrefix) {
  const node = path.getValue();
  const prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return concat([
    prefix,
    printChildren(path, options, print, {
      processor: (childPath, index) => {
        if (index === 0 && childPath.getValue().type !== "list") {
          return align(" ".repeat(prefix.length), childPath.call(print));
        }

        const alignment = " ".repeat(
          clamp(options.tabWidth - listPrefix.length, 0, 3) // 4+ will cause indented code block
        );
        return concat([alignment, align(alignment, childPath.call(print))]);
      },
    }),
  ]);
}

function alignListPrefix(prefix, options) {
  const additionalSpaces = getAdditionalSpaces();
  return (
    prefix +
    " ".repeat(
      additionalSpaces >= 4 ? 0 : additionalSpaces // 4+ will cause indented code block
    )
  );

  function getAdditionalSpaces() {
    const restSpaces = prefix.length % options.tabWidth;
    return restSpaces === 0 ? 0 : options.tabWidth - restSpaces;
  }
}

function getNthListSiblingIndex(node, parentNode) {
  return getNthSiblingIndex(
    node,
    parentNode,
    (siblingNode) => siblingNode.ordered === node.ordered
  );
}

function getNthSiblingIndex(node, parentNode, condition) {
  condition = condition || (() => true);

  let index = -1;

  for (const childNode of parentNode.children) {
    if (childNode.type === node.type && condition(childNode)) {
      index++;
    } else {
      index = -1;
    }

    if (childNode === node) {
      return index;
    }
  }
}

function getAncestorCounter(path, typeOrTypes) {
  const types = [].concat(typeOrTypes);

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.includes(ancestorNode.type)) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function printLine(path, value, options) {
  if (options.proseWrap === "preserve" && value === "\n") {
    return hardline;
  }

  const isBreakable =
    options.proseWrap === "always" &&
    !getAncestorNode(path, SINGLE_LINE_NODE_TYPES);
  return value !== ""
    ? isBreakable
      ? line
      : " "
    : isBreakable
    ? softline
    : "";
}

function printTable(path, options, print) {
  const hardlineWithoutBreakParent = hardline.parts[0];
  const node = path.getValue();
  const contents = []; // { [rowIndex: number]: { [columnIndex: number]: string } }

  path.map((rowPath) => {
    const rowContents = [];

    rowPath.map((cellPath) => {
      rowContents.push(
        printDocToString(cellPath.call(print), options).formatted
      );
    }, "children");

    contents.push(rowContents);
  }, "children");

  // Get the width of each column
  const columnMaxWidths = contents.reduce(
    (currentWidths, rowContents) =>
      currentWidths.map((width, columnIndex) =>
        Math.max(width, privateUtil.getStringWidth(rowContents[columnIndex]))
      ),
    contents[0].map(() => 3) // minimum width = 3 (---, :--, :-:, --:)
  );
  const alignedTable = join(hardlineWithoutBreakParent, [
    printRow(contents[0]),
    printSeparator(),
    join(
      hardlineWithoutBreakParent,
      contents.slice(1).map((rowContents) => printRow(rowContents))
    ),
  ]);

  if (options.proseWrap !== "never") {
    return concat([breakParent, alignedTable]);
  }

  // Only if the --prose-wrap never is set and it exceeds the print width.
  const compactTable = join(hardlineWithoutBreakParent, [
    printRow(contents[0], /* isCompact */ true),
    printSeparator(/* isCompact */ true),
    join(
      hardlineWithoutBreakParent,
      contents
        .slice(1)
        .map((rowContents) => printRow(rowContents, /* isCompact */ true))
    ),
  ]);

  return concat([breakParent, group(ifBreak(compactTable, alignedTable))]);

  function printSeparator(isCompact) {
    return concat([
      "| ",
      join(
        " | ",
        columnMaxWidths.map((width, index) => {
          const spaces = isCompact ? 3 : width;
          switch (node.align[index]) {
            case "left":
              return ":" + "-".repeat(spaces - 1);
            case "right":
              return "-".repeat(spaces - 1) + ":";
            case "center":
              return ":" + "-".repeat(spaces - 2) + ":";
            default:
              return "-".repeat(spaces);
          }
        })
      ),
      " |",
    ]);
  }

  function printRow(rowContents, isCompact) {
    return concat([
      "| ",
      join(
        " | ",
        isCompact
          ? rowContents
          : rowContents.map((rowContent, columnIndex) => {
              switch (node.align[columnIndex]) {
                case "right":
                  return alignRight(rowContent, columnMaxWidths[columnIndex]);
                case "center":
                  return alignCenter(rowContent, columnMaxWidths[columnIndex]);
                default:
                  return alignLeft(rowContent, columnMaxWidths[columnIndex]);
              }
            })
      ),
      " |",
    ]);
  }

  function alignLeft(text, width) {
    const spaces = width - privateUtil.getStringWidth(text);
    return concat([text, " ".repeat(spaces)]);
  }

  function alignRight(text, width) {
    const spaces = width - privateUtil.getStringWidth(text);
    return concat([" ".repeat(spaces), text]);
  }

  function alignCenter(text, width) {
    const spaces = width - privateUtil.getStringWidth(text);
    const left = Math.floor(spaces / 2);
    const right = spaces - left;
    return concat([" ".repeat(left), text, " ".repeat(right)]);
  }
}

function printRoot(path, options, print) {
  /** @typedef {{ index: number, offset: number }} IgnorePosition */
  /** @type {Array<{start: IgnorePosition, end: IgnorePosition}>} */
  const ignoreRanges = [];

  /** @type {IgnorePosition | null} */
  let ignoreStart = null;

  const { children } = path.getValue();
  children.forEach((childNode, index) => {
    switch (isPrettierIgnore(childNode)) {
      case "start":
        if (ignoreStart === null) {
          ignoreStart = { index, offset: childNode.position.end.offset };
        }
        break;
      case "end":
        if (ignoreStart !== null) {
          ignoreRanges.push({
            start: ignoreStart,
            end: { index, offset: childNode.position.start.offset },
          });
          ignoreStart = null;
        }
        break;
      default:
        // do nothing
        break;
    }
  });

  return printChildren(path, options, print, {
    processor: (childPath, index) => {
      if (ignoreRanges.length !== 0) {
        const ignoreRange = ignoreRanges[0];

        if (index === ignoreRange.start.index) {
          return concat([
            children[ignoreRange.start.index].value,
            options.originalText.slice(
              ignoreRange.start.offset,
              ignoreRange.end.offset
            ),
            children[ignoreRange.end.index].value,
          ]);
        }

        if (ignoreRange.start.index < index && index < ignoreRange.end.index) {
          return false;
        }

        if (index === ignoreRange.end.index) {
          ignoreRanges.shift();
          return false;
        }
      }

      return childPath.call(print);
    },
  });
}

function printChildren(path, options, print, events) {
  events = events || {};

  const postprocessor = events.postprocessor || concat;
  const processor = events.processor || ((childPath) => childPath.call(print));

  const node = path.getValue();
  const parts = [];

  let lastChildNode;

  path.map((childPath, index) => {
    const childNode = childPath.getValue();

    const result = processor(childPath, index);
    if (result !== false) {
      const data = {
        parts,
        prevNode: lastChildNode,
        parentNode: node,
        options,
      };

      if (!shouldNotPrePrintHardline(childNode, data)) {
        parts.push(hardline);

        if (lastChildNode && TRAILING_HARDLINE_NODES.has(lastChildNode.type)) {
          if (shouldPrePrintTripleHardline(childNode, data)) {
            parts.push(hardline);
          }
        } else {
          if (
            shouldPrePrintDoubleHardline(childNode, data) ||
            shouldPrePrintTripleHardline(childNode, data)
          ) {
            parts.push(hardline);
          }

          if (shouldPrePrintTripleHardline(childNode, data)) {
            parts.push(hardline);
          }
        }
      }

      parts.push(result);

      lastChildNode = childNode;
    }
  }, "children");

  return postprocessor(parts);
}

function getLastDescendantNode(node) {
  let current = node;
  while (current.children && current.children.length !== 0) {
    current = current.children[current.children.length - 1];
  }
  return current;
}

/** @return {false | 'next' | 'start' | 'end'} */
function isPrettierIgnore(node) {
  if (node.type !== "html") {
    return false;
  }
  const match = node.value.match(
    /^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/
  );
  return match === null ? false : match[1] ? match[1] : "next";
}

function shouldNotPrePrintHardline(node, data) {
  const isFirstNode = data.parts.length === 0;
  const isInlineNode = INLINE_NODE_TYPES.includes(node.type);

  const isInlineHTML =
    node.type === "html" &&
    INLINE_NODE_WRAPPER_TYPES.includes(data.parentNode.type);

  return isFirstNode || isInlineNode || isInlineHTML;
}

function shouldPrePrintDoubleHardline(node, data) {
  const isSequence = (data.prevNode && data.prevNode.type) === node.type;
  const isSiblingNode = isSequence && SIBLING_NODE_TYPES.has(node.type);

  const isInTightListItem =
    data.parentNode.type === "listItem" && !data.parentNode.loose;

  const isPrevNodeLooseListItem =
    data.prevNode && data.prevNode.type === "listItem" && data.prevNode.loose;

  const isPrevNodePrettierIgnore = isPrettierIgnore(data.prevNode) === "next";

  const isBlockHtmlWithoutBlankLineBetweenPrevHtml =
    node.type === "html" &&
    data.prevNode &&
    data.prevNode.type === "html" &&
    data.prevNode.position.end.line + 1 === node.position.start.line;

  const isHtmlDirectAfterListItem =
    node.type === "html" &&
    data.parentNode.type === "listItem" &&
    data.prevNode &&
    data.prevNode.type === "paragraph" &&
    data.prevNode.position.end.line + 1 === node.position.start.line;

  return (
    isPrevNodeLooseListItem ||
    !(
      isSiblingNode ||
      isInTightListItem ||
      isPrevNodePrettierIgnore ||
      isBlockHtmlWithoutBlankLineBetweenPrevHtml ||
      isHtmlDirectAfterListItem
    )
  );
}

function shouldPrePrintTripleHardline(node, data) {
  const isPrevNodeList = data.prevNode && data.prevNode.type === "list";
  const isIndentedCode = node.type === "code" && node.isIndented;

  return isPrevNodeList && isIndentedCode;
}

function shouldRemainTheSameContent(path) {
  const ancestorNode = getAncestorNode(path, [
    "linkReference",
    "imageReference",
  ]);

  return (
    ancestorNode &&
    (ancestorNode.type !== "linkReference" ||
      ancestorNode.referenceType !== "full")
  );
}

function printUrl(url, dangerousCharOrChars) {
  const dangerousChars = [" "].concat(dangerousCharOrChars || []);
  return new RegExp(dangerousChars.map((x) => `\\${x}`).join("|")).test(url)
    ? `<${url}>`
    : url;
}

function printTitle(title, options, printSpace) {
  if (printSpace == null) {
    printSpace = true;
  }

  if (!title) {
    return "";
  }
  if (printSpace) {
    return " " + printTitle(title, options, false);
  }
  if (title.includes('"') && title.includes("'") && !title.includes(")")) {
    return `(${title})`; // avoid escaped quotes
  }
  // faster than using RegExps: https://jsperf.com/performance-of-match-vs-split
  const singleCount = title.split("'").length - 1;
  const doubleCount = title.split('"').length - 1;
  const quote =
    singleCount > doubleCount
      ? '"'
      : doubleCount > singleCount
      ? "'"
      : options.singleQuote
      ? "'"
      : '"';
  title = title.replace(new RegExp(`(${quote})`, "g"), "\\$1");
  return `${quote}${title}${quote}`;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function clean(ast, newObj, parent) {
  delete newObj.position;
  delete newObj.raw; // front-matter

  // for codeblock
  if (
    isFrontMatterNode(ast) ||
    ast.type === "code" ||
    ast.type === "yaml" ||
    ast.type === "import" ||
    ast.type === "export" ||
    ast.type === "jsx"
  ) {
    delete newObj.value;
  }

  if (ast.type === "list") {
    delete newObj.isAligned;
  }

  // texts can be splitted or merged
  if (ast.type === "text") {
    return null;
  }

  if (ast.type === "inlineCode") {
    newObj.value = ast.value.replace(/[\t\n ]+/g, " ");
  }

  // for insert pragma
  if (
    parent &&
    parent.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === ast ||
      (isFrontMatterNode(parent.children[0]) && parent.children[1] === ast)) &&
    ast.type === "html" &&
    pragma.startWithPragma(ast.value)
  ) {
    return null;
  }
}

function hasPrettierIgnore(path) {
  const index = +path.getName();

  if (index === 0) {
    return false;
  }

  const prevNode = path.getParentNode().children[index - 1];
  return isPrettierIgnore(prevNode) === "next";
}

module.exports = {
  preprocess,
  print: genericPrint,
  embed,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma: pragma.insertPragma,
};
