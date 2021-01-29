"use strict";

/** @type {import("assert")} */
const assert = require("assert");

const {
  builders: { line, hardline, breakParent, indent, lineSuffix, join, cursor },
} = require("../document");

const {
  hasNewline,
  skipNewline,
  skipSpaces,
  isPreviousLineEmpty,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
  isNonEmptyArray,
} = require("../common/util");

const childNodesCache = new WeakMap();
function getSortedChildNodes(node, options, resultArray) {
  if (!node) {
    return;
  }
  const { printer, locStart, locEnd } = options;

  if (resultArray) {
    if (printer.canAttachComment && printer.canAttachComment(node)) {
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      let i;
      for (i = resultArray.length - 1; i >= 0; --i) {
        if (
          locStart(resultArray[i]) <= locStart(node) &&
          locEnd(resultArray[i]) <= locEnd(node)
        ) {
          break;
        }
      }
      resultArray.splice(i + 1, 0, node);
      return;
    }
  } else if (childNodesCache.has(node)) {
    return childNodesCache.get(node);
  }

  const childNodes =
    (printer.getCommentChildNodes &&
      printer.getCommentChildNodes(node, options)) ||
    (typeof node === "object" &&
      Object.entries(node)
        .filter(
          ([n]) =>
            n !== "enclosingNode" &&
            n !== "precedingNode" &&
            n !== "followingNode" &&
            n !== "tokens" &&
            n !== "comments"
        )
        .map(([, value]) => value));

  if (!childNodes) {
    return;
  }

  if (!resultArray) {
    resultArray = [];
    childNodesCache.set(node, resultArray);
  }

  for (const childNode of childNodes) {
    getSortedChildNodes(childNode, options, resultArray);
  }

  return resultArray;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, options, enclosingNode) {
  const { locStart, locEnd } = options;
  const commentStart = locStart(comment);
  const commentEnd = locEnd(comment);

  const childNodes = getSortedChildNodes(node, options);
  let precedingNode;
  let followingNode;
  // Time to dust off the old binary search robes and wizard hat.
  let left = 0;
  let right = childNodes.length;
  while (left < right) {
    const middle = (left + right) >> 1;
    const child = childNodes[middle];
    const start = locStart(child);
    const end = locEnd(child);

    // The comment is completely contained by this child node.
    if (start <= commentStart && commentEnd <= end) {
      // Abandon the binary search at this level.
      return decorateComment(child, comment, options, child);
    }

    if (end <= commentStart) {
      // This child node falls completely before the comment.
      // Because we will never consider this node or any nodes
      // before it again, this node must be the closest preceding
      // node we have encountered so far.
      precedingNode = child;
      left = middle + 1;
      continue;
    }

    if (commentEnd <= start) {
      // This child node falls completely after the comment.
      // Because we will never consider this node or any nodes after
      // it again, this node must be the closest following node we
      // have encountered so far.
      followingNode = child;
      right = middle;
      continue;
    }

    /* istanbul ignore next */
    throw new Error("Comment location overlaps with node location");
  }

  // We don't want comments inside of different expressions inside of the same
  // template literal to move to another expression.
  if (enclosingNode && enclosingNode.type === "TemplateLiteral") {
    const { quasis } = enclosingNode;
    const commentIndex = findExpressionIndexForComment(
      quasis,
      comment,
      options
    );

    if (
      precedingNode &&
      findExpressionIndexForComment(quasis, precedingNode, options) !==
        commentIndex
    ) {
      precedingNode = null;
    }
    if (
      followingNode &&
      findExpressionIndexForComment(quasis, followingNode, options) !==
        commentIndex
    ) {
      followingNode = null;
    }
  }

  return { enclosingNode, precedingNode, followingNode };
}

const returnFalse = () => false;
function attach(comments, ast, text, options) {
  if (!Array.isArray(comments)) {
    return;
  }

  const tiesToBreak = [];
  const {
    locStart,
    locEnd,
    printer: { handleComments = {} },
  } = options;
  // TODO: Make this as default behavior
  const {
    avoidAstMutation,
    ownLine: handleOwnLineComment = returnFalse,
    endOfLine: handleEndOfLineComment = returnFalse,
    remaining: handleRemainingComment = returnFalse,
  } = handleComments;

  const decoratedComments = comments.map((comment, index) => ({
    ...decorateComment(ast, comment, options),
    comment,
    text,
    options,
    ast,
    isLastComment: comments.length - 1 === index,
  }));

  for (const [index, context] of decoratedComments.entries()) {
    const {
      comment,
      precedingNode,
      enclosingNode,
      followingNode,
      text,
      options,
      ast,
      isLastComment,
    } = context;

    if (
      options.parser === "json" ||
      options.parser === "json5" ||
      options.parser === "__js_expression" ||
      options.parser === "__vue_expression"
    ) {
      if (locStart(comment) - locStart(ast) <= 0) {
        addLeadingComment(ast, comment);
        continue;
      }
      if (locEnd(comment) - locEnd(ast) >= 0) {
        addTrailingComment(ast, comment);
        continue;
      }
    }

    let args;
    if (avoidAstMutation) {
      args = [context];
    } else {
      comment.enclosingNode = enclosingNode;
      comment.precedingNode = precedingNode;
      comment.followingNode = followingNode;
      args = [comment, text, options, ast, isLastComment];
    }

    if (isOwnLineComment(text, options, decoratedComments, index)) {
      comment.placement = "ownLine";
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.
      if (handleOwnLineComment(...args)) {
        // We're good
      } else if (followingNode) {
        // Always a leading comment.
        addLeadingComment(followingNode, comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else if (isEndOfLineComment(text, options, decoratedComments, index)) {
      comment.placement = "endOfLine";
      if (handleEndOfLineComment(...args)) {
        // We're good
      } else if (precedingNode) {
        // There is content before this comment on the same line, but
        // none after it, so prefer a trailing comment of the previous node.
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else {
      comment.placement = "remaining";
      if (handleRemainingComment(...args)) {
        // We're good
      } else if (precedingNode && followingNode) {
        // Otherwise, text exists both before and after the comment on
        // the same line. If there is both a preceding and following
        // node, use a tie-breaking algorithm to determine if it should
        // be attached to the next or previous node. In the last case,
        // simply attach the right node;
        const tieCount = tiesToBreak.length;
        if (tieCount > 0) {
          const lastTie = tiesToBreak[tieCount - 1];
          if (lastTie.followingNode !== followingNode) {
            breakTies(tiesToBreak, text, options);
          }
        }
        tiesToBreak.push(context);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    }
  }

  breakTies(tiesToBreak, text, options);

  if (!avoidAstMutation) {
    for (const comment of comments) {
      // These node references were useful for breaking ties, but we
      // don't need them anymore, and they create cycles in the AST that
      // may lead to infinite recursion if we don't delete them here.
      delete comment.precedingNode;
      delete comment.enclosingNode;
      delete comment.followingNode;
    }
  }
}

const isAllEmptyAndNoLineBreak = (text) => !/[\S\n\u2028\u2029]/.test(text);
function isOwnLineComment(text, options, decoratedComments, commentIndex) {
  const { comment, precedingNode } = decoratedComments[commentIndex];
  const { locStart, locEnd } = options;
  let start = locStart(comment);

  if (precedingNode) {
    // Find first comment on the same line
    for (let index = commentIndex - 1; index >= 0; index--) {
      const {
        comment,
        precedingNode: currentCommentPrecedingNode,
      } = decoratedComments[index];
      if (
        currentCommentPrecedingNode !== precedingNode ||
        !isAllEmptyAndNoLineBreak(text.slice(locEnd(comment), start))
      ) {
        break;
      }
      start = locStart(comment);
    }
  }

  return hasNewline(text, start, { backwards: true });
}

function isEndOfLineComment(text, options, decoratedComments, commentIndex) {
  const { comment, followingNode } = decoratedComments[commentIndex];
  const { locStart, locEnd } = options;
  let end = locEnd(comment);

  if (followingNode) {
    // Find last comment on the same line
    for (
      let index = commentIndex + 1;
      index < decoratedComments.length;
      index++
    ) {
      const {
        comment,
        followingNode: currentCommentFollowingNode,
      } = decoratedComments[index];
      if (
        currentCommentFollowingNode !== followingNode ||
        !isAllEmptyAndNoLineBreak(text.slice(end, locStart(comment)))
      ) {
        break;
      }
      end = locEnd(comment);
    }
  }

  return hasNewline(text, end);
}

function breakTies(tiesToBreak, text, options) {
  const tieCount = tiesToBreak.length;
  if (tieCount === 0) {
    return;
  }
  const { precedingNode, followingNode, enclosingNode } = tiesToBreak[0];

  const gapRegExp =
    (options.printer.getGapRegex &&
      options.printer.getGapRegex(enclosingNode)) ||
    /^[\s(]*$/;

  let gapEndPos = options.locStart(followingNode);

  // Iterate backwards through tiesToBreak, examining the gaps
  // between the tied comments. In order to qualify as leading, a
  // comment must be separated from followingNode by an unbroken series of
  // gaps (or other comments). Gaps should only contain whitespace or open
  // parentheses.
  let indexOfFirstLeadingComment;
  for (
    indexOfFirstLeadingComment = tieCount;
    indexOfFirstLeadingComment > 0;
    --indexOfFirstLeadingComment
  ) {
    const {
      comment,
      precedingNode: currentCommentPrecedingNode,
      followingNode: currentCommentFollowingNode,
    } = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert.strictEqual(currentCommentPrecedingNode, precedingNode);
    assert.strictEqual(currentCommentFollowingNode, followingNode);

    const gap = text.slice(options.locEnd(comment), gapEndPos);

    if (gapRegExp.test(gap)) {
      gapEndPos = options.locStart(comment);
    } else {
      // The gap string contained something other than whitespace or open
      // parentheses.
      break;
    }
  }

  for (const [i, { comment }] of tiesToBreak.entries()) {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(precedingNode, comment);
    } else {
      addLeadingComment(followingNode, comment);
    }
  }

  for (const node of [precedingNode, followingNode]) {
    if (node.comments && node.comments.length > 1) {
      node.comments.sort((a, b) => options.locStart(a) - options.locStart(b));
    }
  }

  tiesToBreak.length = 0;
}

function printComment(commentPath, options) {
  const comment = commentPath.getValue();
  comment.printed = true;
  return options.printer.printComment(commentPath, options);
}

function findExpressionIndexForComment(quasis, comment, options) {
  const startPos = options.locStart(comment) - 1;

  for (let i = 1; i < quasis.length; ++i) {
    if (startPos < options.locStart(quasis[i])) {
      return i - 1;
    }
  }

  // We haven't found it, it probably means that some of the locations are off.
  // Let's just return the first one.
  /* istanbul ignore next */
  return 0;
}

function printLeadingComment(commentPath, options) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath, options);
  /* istanbul ignore next */
  if (!contents) {
    return "";
  }
  const isBlock =
    options.printer.isBlockComment && options.printer.isBlockComment(comment);

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    const lineBreak = hasNewline(options.originalText, options.locEnd(comment))
      ? hasNewline(options.originalText, options.locStart(comment), {
          backwards: true,
        })
        ? hardline
        : line
      : " ";

    return [contents, lineBreak];
  }

  return [contents, hardline];
}

function printTrailingComment(commentPath, options) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath, options);
  /* istanbul ignore next */
  if (!contents) {
    return "";
  }
  const { printer, originalText, locStart } = options;
  const isBlock = printer.isBlockComment && printer.isBlockComment(comment);

  if (hasNewline(originalText, locStart(comment), { backwards: true })) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.

    const isLineBeforeEmpty = isPreviousLineEmpty(
      originalText,
      comment,
      locStart
    );

    return lineSuffix([hardline, isLineBeforeEmpty ? hardline : "", contents]);
  }

  let printed = [" ", contents];

  // Trailing block comments never need a newline
  if (!isBlock) {
    printed = [lineSuffix(printed), breakParent];
  }

  return printed;
}

function printDanglingComments(path, options, sameIndent, filter) {
  const parts = [];
  const node = path.getValue();

  if (!node || !node.comments) {
    return "";
  }

  path.each((commentPath) => {
    const comment = commentPath.getValue();
    if (
      comment &&
      !comment.leading &&
      !comment.trailing &&
      (!filter || filter(comment))
    ) {
      parts.push(printComment(commentPath, options));
    }
  }, "comments");

  if (parts.length === 0) {
    return "";
  }

  if (sameIndent) {
    return join(hardline, parts);
  }
  return indent([hardline, join(hardline, parts)]);
}

function prependCursorPlaceholder(path, options, printed) {
  if (path.getNode() === options.cursorNode && path.getValue()) {
    return [cursor, printed, cursor];
  }
  return printed;
}

function printComments(path, print, options, needsSemi) {
  const value = path.getValue();
  const printed = print(path);
  const comments = value && value.comments;

  if (!isNonEmptyArray(comments)) {
    return prependCursorPlaceholder(path, options, printed);
  }

  const leadingParts = [];
  const trailingParts = [needsSemi ? ";" : "", printed];

  path.each((commentPath) => {
    const comment = commentPath.getValue();
    const { leading, trailing } = comment;

    if (leading) {
      const contents = printLeadingComment(commentPath, options);
      /* istanbul ignore next */
      if (!contents) {
        return;
      }
      leadingParts.push(contents);

      const text = options.originalText;
      const index = skipNewline(
        text,
        skipSpaces(text, options.locEnd(comment))
      );
      if (index !== false && hasNewline(text, index)) {
        leadingParts.push(hardline);
      }
    } else if (trailing) {
      trailingParts.push(printTrailingComment(commentPath, options));
    }
  }, "comments");

  return prependCursorPlaceholder(path, options, [
    ...leadingParts,
    ...trailingParts,
  ]);
}

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

  for (const comment of astComments) {
    if (!comment.printed) {
      throw new Error(
        `Comment "${comment.value.trim()}" was not printed. Please report this error!`
      );
    }
    delete comment.printed;
  }
}

module.exports = {
  attach,
  printComments,
  printDanglingComments,
  getSortedChildNodes,
  ensureAllCommentsPrinted,
};
