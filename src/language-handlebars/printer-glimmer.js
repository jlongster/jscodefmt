"use strict";

const {
  builders: { dedent, group, hardline, ifBreak, indent, join, line, softline },
} = require("../document");
const { isNonEmptyArray, replaceEndOfLineWith } = require("../common/util");

const { literalline } = require("../document/doc-builders");
const { locStart, locEnd } = require("./loc");
const clean = require("./clean");
const {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isLastNodeOfSiblings,
  isNextNodeOfSomeType,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isVoid,
  isWhitespaceNode,
} = require("./utils");

// Formatter based on @glimmerjs/syntax's built-in test formatter:
// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

function print(path, options, print) {
  const n = path.getValue();

  /* istanbul ignore if*/
  if (!n) {
    return "";
  }

  if (hasPrettierIgnore(path)) {
    return options.originalText.slice(locStart(n), locEnd(n));
  }

  switch (n.type) {
    case "Block":
    case "Program":
    case "Template": {
      return group(path.map(print, "body"));
    }

    case "ElementNode": {
      const startingTag = group(printStartingTag(path, print));

      const escapeNextElementNode =
        options.htmlWhitespaceSensitivity !== "strict" &&
        isNextNodeOfSomeType(path, ["ElementNode"])
          ? softline
          : "";

      if (isVoid(n)) {
        return [startingTag, escapeNextElementNode];
      }

      const endingTag = ["</", n.tag, ">"];

      if (n.children.length === 0) {
        return [startingTag, indent(endingTag), escapeNextElementNode];
      }

      if (options.htmlWhitespaceSensitivity !== "strict") {
        return [
          startingTag,
          indent(printChildren(path, options, print)),
          hardline,
          indent(endingTag),
          escapeNextElementNode,
        ];
      }

      return [
        startingTag,
        indent(group(printChildren(path, options, print))),
        indent(endingTag),
        escapeNextElementNode,
      ];
    }

    case "BlockStatement": {
      const pp = path.getParentNode(1);

      const isElseIf =
        pp &&
        pp.inverse &&
        pp.inverse.body.length === 1 &&
        pp.inverse.body[0] === n &&
        pp.inverse.body[0].path.parts[0] === "if";

      if (isElseIf) {
        return [
          printElseIfBlock(path, print),
          printProgram(path, print, options),
          printInverse(path, print, options),
        ];
      }

      return [
        printOpenBlock(path, print),
        group([
          printProgram(path, print, options),
          printInverse(path, print, options),
          printCloseBlock(path, print, options),
        ]),
      ];
    }

    case "ElementModifierStatement": {
      return group(["{{", printPathAndParams(path, print), softline, "}}"]);
    }
    case "MustacheStatement": {
      const isParentOfSpecifiedTypes = isParentOfSomeType(path, [
        "AttrNode",
        "ConcatStatement",
      ]);

      const isChildOfElementNodeAndDoesNotHaveParams =
        isParentOfSomeType(path, ["ElementNode"]) &&
        doesNotHaveHashParams(n) &&
        doesNotHavePositionalParams(n);

      const shouldBreakOpeningMustache =
        isParentOfSpecifiedTypes || isChildOfElementNodeAndDoesNotHaveParams;

      return group([
        printOpeningMustache(n),
        shouldBreakOpeningMustache ? indent(softline) : "",
        printPathAndParams(path, print),
        softline,
        printClosingMustache(n),
      ]);
    }

    case "SubExpression": {
      return group([
        "(",
        printSubExpressionPathAndParams(path, print),
        softline,
        ")",
      ]);
    }
    case "AttrNode": {
      const isText = n.value.type === "TextNode";
      const isEmptyText = isText && n.value.chars === "";

      // If the text is empty and the value's loc start and end offsets are the
      // same, there is no value for this AttrNode and it should be printed
      // without the `=""`. Example: `<img data-test>` -> `<img data-test>`
      if (isEmptyText && locStart(n.value) === locEnd(n.value)) {
        return n.name;
      }

      // Let's assume quotes inside the content of text nodes are already
      // properly escaped with entities, otherwise the parse wouldn't have parsed them.
      const quote = isText
        ? chooseEnclosingQuote(options, n.value.chars).quote
        : n.value.type === "ConcatStatement"
        ? chooseEnclosingQuote(
            options,
            n.value.parts
              .filter((part) => part.type === "TextNode")
              .map((part) => part.chars)
              .join("")
          ).quote
        : "";

      const valueDoc = path.call(print, "value");

      return [
        n.name,
        "=",
        quote,
        n.name === "class" && quote ? group(indent(valueDoc)) : valueDoc,
        quote,
      ];
    }

    case "ConcatStatement": {
      return path.map(print, "parts");
    }

    case "Hash": {
      return join(line, path.map(print, "pairs"));
    }
    case "HashPair": {
      return [n.key, "=", path.call(print, "value")];
    }
    case "TextNode": {
      /* if `{{my-component}}` (or any text containing "{{")
       * makes it to the TextNode, it means it was escaped,
       * so let's print it escaped, ie.; `\{{my-component}}` */
      let text = n.chars.replace(/{{/g, "\\{{");

      const attrName = getCurrentAttributeName(path);

      if (attrName) {
        // TODO: format style and srcset attributes
        if (attrName === "class") {
          const formattedClasses = text.trim().split(/\s+/).join(" ");

          let leadingSpace = false;
          let trailingSpace = false;

          if (isParentOfSomeType(path, ["ConcatStatement"])) {
            if (
              isPreviousNodeOfSomeType(path, ["MustacheStatement"]) &&
              /^\s/.test(text)
            ) {
              leadingSpace = true;
            }
            if (
              isNextNodeOfSomeType(path, ["MustacheStatement"]) &&
              /\s$/.test(text) &&
              formattedClasses !== ""
            ) {
              trailingSpace = true;
            }
          }

          return [
            leadingSpace ? line : "",
            formattedClasses,
            trailingSpace ? line : "",
          ];
        }

        return replaceEndOfLineWith(text, literalline);
      }

      if (options.htmlWhitespaceSensitivity === "strict") {
        // https://infra.spec.whatwg.org/#ascii-whitespace
        const leadingWhitespacesRE = /^[\t\n\f\r ]*/;
        const trailingWhitespacesRE = /[\t\n\f\r ]*$/;
        const whitespacesOnlyRE = /^[\t\n\f\r ]*$/;

        if (whitespacesOnlyRE.test(text)) {
          let breaks = [line];

          const newlines = countNewLines(text);
          if (newlines) {
            breaks = generateHardlines(newlines, 2);
          }

          if (isLastNodeOfSiblings(path)) {
            breaks = breaks.map((newline) => dedent(newline));
          }

          return breaks;
        }

        const [lead] = text.match(leadingWhitespacesRE);
        const [tail] = text.match(trailingWhitespacesRE);

        let leadBreaks = [];
        if (lead) {
          leadBreaks = [line];

          const leadingNewlines = countNewLines(lead);
          if (leadingNewlines) {
            leadBreaks = generateHardlines(countNewLines(lead) || 1, 2);
          }

          text = text.replace(leadingWhitespacesRE, "");
        }

        let trailBreaks = [];
        if (tail) {
          trailBreaks = [line];

          const trailingNewlines = countNewLines(tail);
          if (trailingNewlines) {
            trailBreaks = generateHardlines(trailingNewlines || 1, 2);

            if (isLastNodeOfSiblings(path)) {
              trailBreaks = trailBreaks.map((hardline) => dedent(hardline));
            }
          }

          text = text.replace(trailingWhitespacesRE, "");
        }

        return [...leadBreaks, text, ...trailBreaks];
      }

      const maxLineBreaksToPreserve = 2;
      const isFirstElement = !getPreviousNode(path);
      const isLastElement = !getNextNode(path);
      const isWhitespaceOnly = !/\S/.test(text);
      const lineBreaksCount = countNewLines(text);

      let leadingLineBreaksCount = countLeadingNewLines(text);
      let trailingLineBreaksCount = countTrailingNewLines(text);

      if (
        (isFirstElement || isLastElement) &&
        isWhitespaceOnly &&
        isParentOfSomeType(path, ["Block", "ElementNode", "Template"])
      ) {
        return "";
      }

      if (isWhitespaceOnly && lineBreaksCount) {
        leadingLineBreaksCount = Math.min(
          lineBreaksCount,
          maxLineBreaksToPreserve
        );
        trailingLineBreaksCount = 0;
      } else {
        if (isNextNodeOfSomeType(path, ["BlockStatement", "ElementNode"])) {
          trailingLineBreaksCount = Math.max(trailingLineBreaksCount, 1);
        }

        if (isPreviousNodeOfSomeType(path, ["BlockStatement", "ElementNode"])) {
          leadingLineBreaksCount = Math.max(leadingLineBreaksCount, 1);
        }
      }

      let leadingSpace = "";
      let trailingSpace = "";

      if (
        trailingLineBreaksCount === 0 &&
        isNextNodeOfSomeType(path, ["MustacheStatement"])
      ) {
        trailingSpace = " ";
      }

      if (
        leadingLineBreaksCount === 0 &&
        isPreviousNodeOfSomeType(path, ["MustacheStatement"])
      ) {
        leadingSpace = " ";
      }

      if (isFirstElement) {
        leadingLineBreaksCount = 0;
        leadingSpace = "";
      }

      if (isLastElement) {
        trailingLineBreaksCount = 0;
        trailingSpace = "";
      }

      return [
        ...generateHardlines(leadingLineBreaksCount, maxLineBreaksToPreserve),
        text.replace(/^\s+/g, leadingSpace).replace(/\s+$/, trailingSpace),
        ...generateHardlines(trailingLineBreaksCount, maxLineBreaksToPreserve),
      ];
    }
    case "MustacheCommentStatement": {
      const start = locStart(n);
      const end = locEnd(n);
      // Starts with `{{~`
      const isLeftWhiteSpaceSensitive =
        options.originalText.charAt(start + 2) === "~";
      // Ends with `{{~`
      const isRightWhitespaceSensitive =
        options.originalText.charAt(end - 3) === "~";

      const dashes = n.value.includes("}}") ? "--" : "";
      return [
        "{{",
        isLeftWhiteSpaceSensitive ? "~" : "",
        "!",
        dashes,
        n.value,
        dashes,
        isRightWhitespaceSensitive ? "~" : "",
        "}}",
      ];
    }
    case "PathExpression": {
      return n.original;
    }
    case "BooleanLiteral": {
      return String(n.value);
    }
    case "CommentStatement": {
      return ["<!--", n.value, "-->"];
    }
    case "StringLiteral": {
      return printStringLiteral(n.value, options);
    }
    case "NumberLiteral": {
      return String(n.value);
    }
    case "UndefinedLiteral": {
      return "undefined";
    }
    case "NullLiteral": {
      return "null";
    }

    /* istanbul ignore next */
    default:
      throw new Error(`unknown glimmer type: ${JSON.stringify(n.type)}`);
  }
}

/* ElementNode print helpers */

function printStartingTag(path, print) {
  const node = path.getValue();

  const attributesLike = ["attributes", "modifiers", "comments", "blockParams"]
    .filter((property) => isNonEmptyArray(node[property]))
    .map((property) => [
      line,
      property === "blockParams"
        ? printBlockParams(node)
        : join(line, path.map(print, property)),
    ]);

  return [
    "<",
    node.tag,
    indent(attributesLike),
    printStartingTagEndMarker(node),
  ];
}

function printChildren(path, options, print) {
  const node = path.getValue();
  const isEmpty = node.children.every((n) => isWhitespaceNode(n));
  if (options.htmlWhitespaceSensitivity !== "strict" && isEmpty) {
    return "";
  }

  return path.map((childPath, childIndex) => {
    const printedChild = print(childPath, options, print);

    if (childIndex === 0 && options.htmlWhitespaceSensitivity !== "strict") {
      return [softline, printedChild];
    }

    return printedChild;
  }, "children");
}

function printStartingTagEndMarker(node) {
  if (isVoid(node)) {
    return ifBreak([softline, "/>"], [" />", softline]);
  }

  return ifBreak([softline, ">"], ">");
}

/* MustacheStatement print helpers */

function printOpeningMustache(node) {
  const mustache = node.escaped === false ? "{{{" : "{{";
  const strip = node.strip && node.strip.open ? "~" : "";
  return [mustache, strip];
}

function printClosingMustache(node) {
  const mustache = node.escaped === false ? "}}}" : "}}";
  const strip = node.strip && node.strip.close ? "~" : "";
  return [strip, mustache];
}

/* BlockStatement print helpers */

function printOpeningBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.openStrip.open ? "~" : "";
  return [opening, strip, "#"];
}

function printOpeningBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.openStrip.close ? "~" : "";
  return [strip, closing];
}

function printClosingBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.closeStrip.open ? "~" : "";
  return [opening, strip, "/"];
}

function printClosingBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.closeStrip.close ? "~" : "";
  return [strip, closing];
}

function printInverseBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.inverseStrip.open ? "~" : "";
  return [opening, strip];
}

function printInverseBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.inverseStrip.close ? "~" : "";
  return [strip, closing];
}

function printOpenBlock(path, print) {
  const node = path.getValue();

  const openingMustache = printOpeningBlockOpeningMustache(node);
  const closingMustache = printOpeningBlockClosingMustache(node);

  const attributes = [printPath(path, print)];

  const params = printParams(path, print);
  if (params) {
    attributes.push(line, params);
  }

  if (isNonEmptyArray(node.program.blockParams)) {
    const block = printBlockParams(node.program);
    attributes.push(line, block);
  }

  return group([
    openingMustache,
    indent(group(attributes)),
    softline,
    closingMustache,
  ]);
}

function printElseBlock(node, options) {
  return [
    options.htmlWhitespaceSensitivity !== "strict" ? hardline : "",
    printInverseBlockOpeningMustache(node),
    "else",
    printInverseBlockClosingMustache(node),
  ];
}

function printElseIfBlock(path, print) {
  const parentNode = path.getParentNode(1);

  return [
    printInverseBlockOpeningMustache(parentNode),
    "else ",
    printPathAndParams(path, print),
    printInverseBlockClosingMustache(parentNode),
  ];
}

function printCloseBlock(path, print, options) {
  const node = path.getValue();

  if (options.htmlWhitespaceSensitivity !== "strict") {
    const escape = blockStatementHasOnlyWhitespaceInProgram(node)
      ? softline
      : hardline;

    return [
      escape,
      printClosingBlockOpeningMustache(node),
      path.call(print, "path"),
      printClosingBlockClosingMustache(node),
    ];
  }

  return [
    printClosingBlockOpeningMustache(node),
    path.call(print, "path"),
    printClosingBlockClosingMustache(node),
  ];
}

function blockStatementHasOnlyWhitespaceInProgram(node) {
  return (
    isNodeOfSomeType(node, ["BlockStatement"]) &&
    node.program.body.every((n) => isWhitespaceNode(n))
  );
}

function blockStatementHasElseIf(node) {
  return (
    blockStatementHasElse(node) &&
    node.inverse.body.length === 1 &&
    isNodeOfSomeType(node.inverse.body[0], ["BlockStatement"]) &&
    node.inverse.body[0].path.parts[0] === "if"
  );
}

function blockStatementHasElse(node) {
  return isNodeOfSomeType(node, ["BlockStatement"]) && node.inverse;
}

function printProgram(path, print, options) {
  const node = path.getValue();

  if (blockStatementHasOnlyWhitespaceInProgram(node)) {
    return "";
  }

  const program = path.call(print, "program");

  if (options.htmlWhitespaceSensitivity !== "strict") {
    return indent([hardline, program]);
  }

  return indent(program);
}

function printInverse(path, print, options) {
  const node = path.getValue();

  const inverse = path.call(print, "inverse");
  const printed =
    options.htmlWhitespaceSensitivity !== "strict"
      ? [hardline, inverse]
      : inverse;

  if (blockStatementHasElseIf(node)) {
    return printed;
  }

  if (blockStatementHasElse(node)) {
    return [printElseBlock(node, options), indent(printed)];
  }

  return "";
}

/* TextNode print helpers */

function getCurrentAttributeName(path) {
  for (let depth = 0; depth < 2; depth++) {
    const parentNode = path.getParentNode(depth);
    if (parentNode && parentNode.type === "AttrNode") {
      return parentNode.name.toLowerCase();
    }
  }
}

function countNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  return string.split("\n").length - 1;
}

function countLeadingNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/^([^\S\n\r]*[\n\r])+/g) || [])[0] || "";
  return countNewLines(newLines);
}

function countTrailingNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/([\n\r][^\S\n\r]*)+$/g) || [])[0] || "";
  return countNewLines(newLines);
}

function generateHardlines(number = 0, max = 0) {
  return new Array(Math.min(number, max)).fill(hardline);
}

/* StringLiteral print helpers */

/**
 * Prints a string literal with the correct surrounding quotes based on
 * `options.singleQuote` and the number of escaped quotes contained in
 * the string literal. This function is the glimmer equivalent of `printString`
 * in `common/util`, but has differences because of the way escaped characters
 * are treated in hbs string literals.
 * @param {string} stringLiteral - the string literal value
 * @param {object} options - the prettier options object
 */
function printStringLiteral(stringLiteral, options) {
  const { quote, regex } = chooseEnclosingQuote(options, stringLiteral);
  return [quote, stringLiteral.replace(regex, `\\${quote}`), quote];
}

function chooseEnclosingQuote(options, stringLiteral) {
  const double = { quote: '"', regex: /"/g };
  const single = { quote: "'", regex: /'/g };

  const preferred = options.singleQuote ? single : double;
  const alternate = preferred === single ? double : single;

  let shouldUseAlternateQuote = false;

  // If `stringLiteral` contains at least one of the quote preferred for
  // enclosing the string, we might want to enclose with the alternate quote
  // instead, to minimize the number of escaped quotes.
  if (
    stringLiteral.includes(preferred.quote) ||
    stringLiteral.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (stringLiteral.match(preferred.regex) || [])
      .length;
    const numAlternateQuotes = (stringLiteral.match(alternate.regex) || [])
      .length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  }

  return shouldUseAlternateQuote ? alternate : preferred;
}

/* SubExpression print helpers */

function printSubExpressionPathAndParams(path, print) {
  const p = printPath(path, print);
  const params = printParams(path, print);

  if (!params) {
    return p;
  }

  return indent([p, line, group(params)]);
}

/* misc. print helpers */

function printPathAndParams(path, print) {
  const p = printPath(path, print);
  const params = printParams(path, print);

  if (!params) {
    return p;
  }

  return indent(group([p, line, params]));
}

function printPath(path, print) {
  return path.call(print, "path");
}

function printParams(path, print) {
  const node = path.getValue();
  const parts = [];

  if (node.params.length > 0) {
    const params = path.map(print, "params");
    parts.push(...params);
  }

  if (node.hash && node.hash.pairs.length > 0) {
    const hash = path.call(print, "hash");
    parts.push(hash);
  }

  if (parts.length === 0) {
    return "";
  }

  return join(line, parts);
}

function printBlockParams(node) {
  return ["as |", node.blockParams.join(" "), "|"];
}

function doesNotHaveHashParams(node) {
  return node.hash.pairs.length === 0;
}

function doesNotHavePositionalParams(node) {
  return node.params.length === 0;
}

module.exports = {
  print,
  massageAstNode: clean,
};
