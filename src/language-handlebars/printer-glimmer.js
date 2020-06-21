"use strict";

const clean = require("./clean");

const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} = require("../document").builders;

const {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
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
    const startOffset = locationToOffset(
      options.originalText,
      n.loc.start.line - 1,
      n.loc.start.column
    );
    const endOffset = locationToOffset(
      options.originalText,
      n.loc.end.line - 1,
      n.loc.end.column
    );

    const ignoredText = options.originalText.slice(startOffset, endOffset);
    return ignoredText;
  }

  switch (n.type) {
    case "Block":
    case "Program":
    case "Template": {
      return group(concat(path.map(print, "body")));
    }
    case "ElementNode": {
      // TODO: make it whitespace sensitive
      const bim = isNextNodeOfSomeType(path, ["ElementNode"]) ? hardline : "";

      if (isVoid(n)) {
        return concat([group(printStartingTag(path, print)), bim]);
      }

      const isWhitespaceOnly = n.children.every((n) => isWhitespaceNode(n));

      return concat([
        group(printStartingTag(path, print)),
        group(
          concat([
            isWhitespaceOnly ? "" : indent(printChildren(path, options, print)),
            n.children.length ? hardline : "",
            concat(["</", n.tag, ">"]),
          ])
        ),
        bim,
      ]);
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
        return concat([
          printElseIfBlock(path, print),
          printProgram(path, print),
          printInverse(path, print),
        ]);
      }

      return concat([
        printOpenBlock(path, print),
        group(
          concat([
            printProgram(path, print),
            printInverse(path, print),
            printCloseBlock(path, print),
          ])
        ),
      ]);
    }
    case "ElementModifierStatement": {
      return group(
        concat(["{{", printPathAndParams(path, print), softline, "}}"])
      );
    }
    case "MustacheStatement": {
      const shouldBreakOpeningMustache = isParentOfSomeType(path, [
        "AttrNode",
        "ConcatStatement",
        "ElementNode",
      ]);

      return group(
        concat([
          printOpeningMustache(n),
          shouldBreakOpeningMustache ? indent(softline) : "",
          printPathAndParams(path, print),
          softline,
          printClosingMustache(n),
        ])
      );
    }

    case "SubExpression": {
      return group(
        concat([
          "(",
          printSubExpressionPathAndParams(path, print),
          softline,
          ")",
        ])
      );
    }
    case "AttrNode": {
      const isText = n.value.type === "TextNode";
      const isEmptyText = isText && n.value.chars === "";

      // If the text is empty and the value's loc start and end columns are the
      // same, there is no value for this AttrNode and it should be printed
      // without the `=""`. Example: `<img data-test>` -> `<img data-test>`
      const isEmptyValue =
        isEmptyText && n.value.loc.start.column === n.value.loc.end.column;
      if (isEmptyValue) {
        return concat([n.name]);
      }
      const value = path.call(print, "value");
      const quotedValue = isText
        ? printStringLiteral(value.parts.join(), options)
        : value;
      return concat([n.name, "=", quotedValue]);
    }

    case "ConcatStatement": {
      const quote = options.singleQuote ? "'" : '"';
      return concat([
        quote,
        ...path.map((partPath) => print(partPath), "parts"),
        quote,
      ]);
    }

    case "Hash": {
      return concat([join(line, path.map(print, "pairs"))]);
    }
    case "HashPair": {
      return concat([n.key, "=", path.call(print, "value")]);
    }
    case "TextNode": {
      const maxLineBreaksToPreserve = 2;
      const isFirstElement = !getPreviousNode(path);
      const isLastElement = !getNextNode(path);
      const isWhitespaceOnly = !/\S/.test(n.chars);
      const lineBreaksCount = countNewLines(n.chars);

      let leadingLineBreaksCount = countLeadingNewLines(n.chars);
      let trailingLineBreaksCount = countTrailingNewLines(n.chars);

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

      // preserve a space inside of an attribute node where whitespace present,
      // when next to mustache statement.
      const inAttrNode = path.stack.includes("attributes");
      if (inAttrNode) {
        if (isParentOfSomeType(path, ["ConcatStatement"])) {
          if (isPreviousNodeOfSomeType(path, ["MustacheStatement"])) {
            leadingSpace = " ";
          }
          if (isNextNodeOfSomeType(path, ["MustacheStatement"])) {
            trailingSpace = " ";
          }
        }
      } else {
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
      }

      return concat([
        ...generateHardlines(leadingLineBreaksCount, maxLineBreaksToPreserve),
        n.chars.replace(/^\s+/g, leadingSpace).replace(/\s+$/, trailingSpace),
        ...generateHardlines(trailingLineBreaksCount, maxLineBreaksToPreserve),
      ]);
    }
    case "MustacheCommentStatement": {
      const dashes = n.value.includes("}}") ? "--" : "";
      return concat(["{{!", dashes, n.value, dashes, "}}"]);
    }
    case "PathExpression": {
      return n.original;
    }
    case "BooleanLiteral": {
      return String(n.value);
    }
    case "CommentStatement": {
      return concat(["<!--", n.value, "-->"]);
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
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

/* ElementNode print helpers */

function printStartingTag(path, print) {
  const node = path.getValue();

  return concat([
    "<",
    node.tag,
    printAttributesLike(path, print),
    printBlockParams(node),
    printStartingTagEndMarker(node),
  ]);
}

function printAttributesLike(path, print) {
  const node = path.getValue();

  return indent(
    concat([
      node.attributes.length ? line : "",
      join(line, path.map(print, "attributes")),

      node.modifiers.length ? line : "",
      join(line, path.map(print, "modifiers")),

      node.comments.length ? line : "",
      join(line, path.map(print, "comments")),
    ])
  );
}

function printChildren(path, options, print) {
  return concat(
    path.map((childPath, childIndex) => {
      if (childIndex === 0) {
        return concat([softline, print(childPath, options, print)]);
      }

      return print(childPath, options, print);
    }, "children")
  );
}

function printStartingTagEndMarker(node) {
  if (isVoid(node)) {
    return ifBreak(concat([softline, "/>"]), concat([" />", softline]));
  }

  return ifBreak(concat([softline, ">"]), ">");
}

/* MustacheStatement print helpers */

function printOpeningMustache(node) {
  const mustache = node.escaped === false ? "{{{" : "{{";
  const strip = node.strip && node.strip.open ? "~" : "";
  return concat([mustache, strip]);
}

function printClosingMustache(node) {
  const mustache = node.escaped === false ? "}}}" : "}}";
  const strip = node.strip && node.strip.close ? "~" : "";
  return concat([strip, mustache]);
}

/* BlockStatement print helpers */

function printOpeningBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.openStrip.open ? "~" : "";
  return concat([opening, strip, "#"]);
}

function printOpeningBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.openStrip.close ? "~" : "";
  return concat([strip, closing]);
}

function printClosingBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.closeStrip.open ? "~" : "";
  return concat([opening, strip, "/"]);
}

function printClosingBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.closeStrip.close ? "~" : "";
  return concat([strip, closing]);
}

function printInverseBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.inverseStrip.open ? "~" : "";
  return concat([opening, strip]);
}

function printInverseBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.inverseStrip.close ? "~" : "";
  return concat([strip, closing]);
}

function printOpenBlock(path, print) {
  const node = path.getValue();

  return group(
    concat([
      printOpeningBlockOpeningMustache(node),
      printPathAndParams(path, print),
      printBlockParams(node.program),
      softline,
      printOpeningBlockClosingMustache(node),
    ])
  );
}

function printElseBlock(node) {
  return concat([
    hardline,
    printInverseBlockOpeningMustache(node),
    "else",
    printInverseBlockClosingMustache(node),
  ]);
}

function printElseIfBlock(path, print) {
  const parentNode = path.getParentNode(1);

  return concat([
    printInverseBlockOpeningMustache(parentNode),
    "else ",
    printPathAndParams(path, print),
    printInverseBlockClosingMustache(parentNode),
  ]);
}

function printCloseBlock(path, print) {
  const node = path.getValue();

  return concat([
    blockStatementHasOnlyWhitespaceInProgram(node) ? softline : hardline,
    printClosingBlockOpeningMustache(node),
    path.call(print, "path"),
    printClosingBlockClosingMustache(node),
  ]);
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

function printProgram(path, print) {
  const node = path.getValue();

  if (blockStatementHasOnlyWhitespaceInProgram(node)) {
    return "";
  }

  const program = path.call(print, "program");
  return indent(concat([hardline, program]));
}

function printInverse(path, print) {
  const node = path.getValue();

  const inverse = path.call(print, "inverse");
  const parts = concat([hardline, inverse]);

  if (blockStatementHasElseIf(node)) {
    return parts;
  }

  if (blockStatementHasElse(node)) {
    return concat([printElseBlock(node), indent(parts)]);
  }

  return "";
}

/* TextNode print helpers */

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

  const enclosingQuote = shouldUseAlternateQuote ? alternate : preferred;
  const escapedStringLiteral = stringLiteral.replace(
    enclosingQuote.regex,
    `\\${enclosingQuote.quote}`
  );

  return concat([
    enclosingQuote.quote,
    escapedStringLiteral,
    enclosingQuote.quote,
  ]);
}

/* SubExpression print helpers */

function printSubExpressionPathAndParams(path, print) {
  const p = printPath(path, print);
  const params = printParams(path, print);

  if (!params) {
    return p;
  }

  return indent(concat([p, line, group(params)]));
}

/* misc. print helpers */

function printPathAndParams(path, print) {
  const p = printPath(path, print);
  const params = printParams(path, print);

  if (!params) {
    return p;
  }

  return indent(group(concat([p, line, params])));
}

function printPath(path, print) {
  return path.call(print, "path");
}

function printParams(path, print) {
  const node = path.getValue();
  const parts = [];

  if (node.params.length) {
    const params = path.map(print, "params");
    parts.push(...params);
  }

  if (node.hash && node.hash.pairs.length > 0) {
    const hash = path.call(print, "hash");
    parts.push(hash);
  }

  if (!parts.length) {
    return "";
  }

  return join(line, parts);
}

function printBlockParams(node) {
  if (!node || !node.blockParams.length) {
    return "";
  }

  return concat([" as |", node.blockParams.join(" "), "|"]);
}

/* istanbul ignore next
   https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/compiler/lib/location.ts#L5-L29
*/
function locationToOffset(source, line, column) {
  let seenLines = 0;
  let seenChars = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (seenChars === source.length) {
      return null;
    }

    let nextLine = source.indexOf("\n", seenChars);
    if (nextLine === -1) {
      nextLine = source.length;
    }

    if (seenLines === line) {
      if (seenChars + column > nextLine) {
        return null;
      }
      return seenChars + column;
    } else if (nextLine === -1) {
      return null;
    }
    seenLines += 1;
    seenChars = nextLine + 1;
  }
}

module.exports = {
  print,
  massageAstNode: clean,
};
