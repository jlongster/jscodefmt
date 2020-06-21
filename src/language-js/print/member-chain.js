"use strict";

const flat = require("lodash/flatten");

const comments = require("../../main/comments");
const { getLast } = require("../../common/util");
const {
  isNextLineEmpty,
  isNextLineEmptyAfterIndex,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../../common/util-shared");
const pathNeedsParens = require("../needs-parens");
const {
  hasLeadingComment,
  hasTrailingComment,
  isCallOrOptionalCallExpression,
  isLiteralLikeValue,
  isLongCurriedCallExpression,
  isMemberish,
  isNumericLiteral,
  isSimpleCallArgument,
} = require("../utils");

const printCallArguments = require("./call-arguments");
const {
  printOptionalToken,
  printFunctionTypeParameters,
  printMemberLookup,
  printBindExpressionCallee,
} = require("./misc");

const {
  builders: {
    concat,
    join,
    hardline,
    group,
    indent,
    conditionalGroup,
    breakParent,
  },
  utils: { willBreak },
} = require("../../document");

// We detect calls on member expressions specially to format a
// common pattern better. The pattern we are looking for is this:
//
// arr
//   .map(x => x + 1)
//   .filter(x => x > 10)
//   .some(x => x % 2)
//
// The way it is structured in the AST is via a nested sequence of
// MemberExpression and CallExpression. We need to traverse the AST
// and make groups out of it to print it in the desired way.
function printMemberChain(path, options, print) {
  const parent = path.getParentNode();
  const isExpressionStatement =
    !parent || parent.type === "ExpressionStatement";

  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   CallExpression(MemberExpression(CallExpression(Identifier)))
  // and we transform it into
  //   [Identifier, CallExpression, MemberExpression, CallExpression]
  const printedNodes = [];

  // Here we try to retain one typed empty line after each call expression or
  // the first group whether it is in parentheses or not
  function shouldInsertEmptyLineAfter(node) {
    const { originalText } = options;
    const nextCharIndex = getNextNonSpaceNonCommentCharacterIndex(
      originalText,
      node,
      options.locEnd
    );
    const nextChar = originalText.charAt(nextCharIndex);

    // if it is cut off by a parenthesis, we only account for one typed empty
    // line after that parenthesis
    if (nextChar === ")") {
      return isNextLineEmptyAfterIndex(
        originalText,
        nextCharIndex + 1,
        options.locEnd
      );
    }

    return isNextLineEmpty(originalText, node, options.locEnd);
  }

  function rec(path) {
    const node = path.getValue();
    if (
      isCallOrOptionalCallExpression(node) &&
      (isMemberish(node.callee) || isCallOrOptionalCallExpression(node.callee))
    ) {
      printedNodes.unshift({
        node,
        printed: concat([
          comments.printComments(
            path,
            () =>
              concat([
                printOptionalToken(path),
                printFunctionTypeParameters(path, options, print),
                printCallArguments(path, options, print),
              ]),
            options
          ),
          shouldInsertEmptyLineAfter(node) ? hardline : "",
        ]),
      });
      path.call((callee) => rec(callee), "callee");
    } else if (isMemberish(node)) {
      printedNodes.unshift({
        node,
        needsParens: pathNeedsParens(path, options),
        printed: comments.printComments(
          path,
          () =>
            node.type === "OptionalMemberExpression" ||
            node.type === "MemberExpression"
              ? printMemberLookup(path, options, print)
              : printBindExpressionCallee(path, options, print),
          options
        ),
      });
      path.call((object) => rec(object), "object");
    } else if (node.type === "TSNonNullExpression") {
      printedNodes.unshift({
        node,
        printed: comments.printComments(path, () => "!", options),
      });
      path.call((expression) => rec(expression), "expression");
    } else {
      printedNodes.unshift({
        node,
        printed: path.call(print),
      });
    }
  }
  // Note: the comments of the root node have already been printed, so we
  // need to extract this first call without printing them as they would
  // if handled inside of the recursive call.
  const node = path.getValue();
  printedNodes.unshift({
    node,
    printed: concat([
      printOptionalToken(path),
      printFunctionTypeParameters(path, options, print),
      printCallArguments(path, options, print),
    ]),
  });

  if (node.callee) {
    path.call((callee) => rec(callee), "callee");
  }

  // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [Identifier, CallExpression],
  //     [MemberExpression, MemberExpression, CallExpression],
  //     [MemberExpression, CallExpression],
  //     [MemberExpression],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e

  // The first group is the first node followed by
  //   - as many CallExpression as possible
  //       < fn()()() >.something()
  //   - as many array accessors as possible
  //       < fn()[0][1][2] >.something()
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()
  const groups = [];
  let currentGroup = [printedNodes[0]];
  let i = 1;
  for (; i < printedNodes.length; ++i) {
    if (
      printedNodes[i].node.type === "TSNonNullExpression" ||
      isCallOrOptionalCallExpression(printedNodes[i].node) ||
      ((printedNodes[i].node.type === "MemberExpression" ||
        printedNodes[i].node.type === "OptionalMemberExpression") &&
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property))
    ) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  if (!isCallOrOptionalCallExpression(printedNodes[0].node)) {
    for (; i + 1 < printedNodes.length; ++i) {
      if (
        isMemberish(printedNodes[i].node) &&
        isMemberish(printedNodes[i + 1].node)
      ) {
        currentGroup.push(printedNodes[i]);
      } else {
        break;
      }
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression
  let hasSeenCallExpression = false;
  for (; i < printedNodes.length; ++i) {
    if (hasSeenCallExpression && isMemberish(printedNodes[i].node)) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property)
      ) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (
      isCallOrOptionalCallExpression(printedNodes[i].node) ||
      printedNodes[i].node.type === "ImportExpression"
    ) {
      hasSeenCallExpression = true;
    }
    currentGroup.push(printedNodes[i]);

    if (
      printedNodes[i].node.comments &&
      printedNodes[i].node.comments.some((comment) => comment.trailing)
    ) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x => x)
  //     .map(x => x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is an identifier with the name starting with a capital
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.
  function isFactory(name) {
    return /^[A-Z]|^[$_]+$/.test(name);
  }

  // In case the Identifier is shorter than tab width, we can keep the
  // first call in a single line, if it's an ExpressionStatement.
  //
  //   d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([0, width]);
  //
  function isShort(name) {
    return name.length <= options.tabWidth;
  }

  function shouldNotWrap(groups) {
    const hasComputed = groups[1].length && groups[1][0].node.computed;

    if (groups[0].length === 1) {
      const firstNode = groups[0][0].node;
      return (
        firstNode.type === "ThisExpression" ||
        (firstNode.type === "Identifier" &&
          (isFactory(firstNode.name) ||
            (isExpressionStatement && isShort(firstNode.name)) ||
            hasComputed))
      );
    }

    const lastNode = getLast(groups[0]).node;
    return (
      (lastNode.type === "MemberExpression" ||
        lastNode.type === "OptionalMemberExpression") &&
      lastNode.property.type === "Identifier" &&
      (isFactory(lastNode.property.name) || hasComputed)
    );
  }

  const shouldMerge =
    groups.length >= 2 && !groups[1][0].node.comments && shouldNotWrap(groups);

  function printGroup(printedGroup) {
    const printed = printedGroup.map((tuple) => tuple.printed);
    // Checks if the last node (i.e. the parent node) needs parens and print
    // accordingly
    if (
      printedGroup.length > 0 &&
      printedGroup[printedGroup.length - 1].needsParens
    ) {
      return concat(["(", ...printed, ")"]);
    }
    return concat(printed);
  }

  function printIndentedGroup(groups) {
    if (groups.length === 0) {
      return "";
    }
    return indent(
      group(concat([hardline, join(hardline, groups.map(printGroup))]))
    );
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = concat(printedGroups);

  const cutoff = shouldMerge ? 3 : 2;
  const flatGroups = flat(groups);

  const hasComment =
    flatGroups.slice(1, -1).some((node) => hasLeadingComment(node.node)) ||
    flatGroups.slice(0, -1).some((node) => hasTrailingComment(node.node)) ||
    (groups[cutoff] && hasLeadingComment(groups[cutoff][0].node));

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (groups.length <= cutoff && !hasComment) {
    if (isLongCurriedCallExpression(path)) {
      return oneLine;
    }
    return group(oneLine);
  }

  // Find out the last node in the first group and check if it has an
  // empty line after
  const lastNodeBeforeIndent = getLast(groups[shouldMerge ? 1 : 0]).node;
  const shouldHaveEmptyLineBeforeIndent =
    !isCallOrOptionalCallExpression(lastNodeBeforeIndent) &&
    shouldInsertEmptyLineAfter(lastNodeBeforeIndent);

  const expanded = concat([
    printGroup(groups[0]),
    shouldMerge ? printGroup(groups[1]) : "",
    shouldHaveEmptyLineBeforeIndent ? hardline : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1)),
  ]);

  const callExpressions = printedNodes
    .map(({ node }) => node)
    .filter(isCallOrOptionalCallExpression);

  function looksLikeFluentConfigurationPattern() {
    if (
      isExpressionStatement &&
      callExpressions.length > 1 &&
      // Keep simple chains like this on one line:
      //    req.checkBody("name").notEmpty().optional();
      !(
        callExpressions[0].arguments.length <= 1 &&
        callExpressions.slice(1).every((expr) => expr.arguments.length === 0)
      )
    ) {
      const allArgs = flat(callExpressions.map((expr) => expr.arguments));
      return allArgs.length > 0 && allArgs.every(isLiteralLikeValue);
    }
    return false;
  }

  function callHasComplexArguments(expr, index) {
    return (
      (index !== 0 && expr.arguments.length > 2) ||
      !expr.arguments.every((arg) => isSimpleCallArgument(arg, 0))
    );
  }

  /**
   * If the last call's argument is a function, it's okay to inline if it fits and there is no other function arguments.
   *
   * This chain should be split:
   *
   *     const mapped = scopes.filter(scope => scope.value !== '').map((scope, i) => {
   *       // multi line content
   *     });
   *
   * This chain can be inlined:
   *
   *     const mapped = scopes.filter(myFilter).map((scope, i) => {
   *       // multi line content
   *     });
   *
   */
  function lastGroupWillBreakAndOtherCallsHaveComplexArguments() {
    const lastGroupNode = getLast(getLast(groups)).node;
    const lastGroupDoc = getLast(printedGroups);
    return (
      isCallOrOptionalCallExpression(lastGroupNode) &&
      willBreak(lastGroupDoc) &&
      callExpressions.some(
        (expr, index) =>
          index !== callExpressions.length - 1 &&
          callHasComplexArguments(expr, index)
      )
    );
  }

  // We don't want to print in one line if at least one of these conditions occurs:
  //  * the chain has comments,
  //  * the head of the chain is a constructor call,
  //  * the chain is an expression statement and all the arguments are literal-like ("fluent configuration" pattern),
  //  * the chain is longer than 2 calls and has non-trivial arguments or more than 2 arguments in any call but the first one,
  //  * any group but the last one has a hard line,
  //  * the last call's arguments have a hard line and other calls have non-trivial arguments.
  if (
    hasComment ||
    printedNodes[0].node.type === "NewExpression" ||
    looksLikeFluentConfigurationPattern() ||
    (callExpressions.length > 2 &&
      callExpressions.some(callHasComplexArguments)) ||
    printedGroups.slice(0, -1).some(willBreak) ||
    lastGroupWillBreakAndOtherCallsHaveComplexArguments()
  ) {
    return group(expanded);
  }

  return concat([
    // We only need to check `oneLine` because if `expanded` is chosen
    // that means that the parent group has already been broken
    // naturally
    willBreak(oneLine) || shouldHaveEmptyLineBeforeIndent ? breakParent : "",
    conditionalGroup([oneLine, expanded]),
  ]);
}

module.exports = printMemberChain;
