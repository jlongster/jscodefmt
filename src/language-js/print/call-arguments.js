"use strict";

const comments = require("../../main/comments");
const { getLast, getPenultimate } = require("../../common/util");
const { isNextLineEmpty } = require("../../common/util-shared");
const {
  hasLeadingComment,
  hasTrailingComment,
  isFunctionCompositionArgs,
  isJSXNode,
  isLongCurriedCallExpression,
  shouldPrintComma,
} = require("../utils");

const {
  builders: {
    concat,
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    ifBreak,
    breakParent,
  },
  utils: { willBreak },
} = require("../../document");

function printCallArguments(path, options, print) {
  const node = path.getValue();
  const isDynamicImport = node.type === "ImportExpression";
  const args = isDynamicImport ? [node.source] : node.arguments;

  if (args.length === 0) {
    return concat([
      "(",
      comments.printDanglingComments(path, options, /* sameIndent */ true),
      ")",
    ]);
  }

  // useEffect(() => { ... }, [foo, bar, baz])
  if (
    args.length === 2 &&
    args[0].type === "ArrowFunctionExpression" &&
    args[0].params.length === 0 &&
    args[0].body.type === "BlockStatement" &&
    args[1].type === "ArrayExpression" &&
    !args.find((arg) => arg.comments)
  ) {
    return concat([
      "(",
      path.call(print, "arguments", 0),
      ", ",
      path.call(print, "arguments", 1),
      ")",
    ]);
  }

  // func(
  //   ({
  //     a,

  //     b
  //   }) => {}
  // );
  function shouldBreakForArrowFunctionInArguments(arg, argPath) {
    if (
      !arg ||
      arg.type !== "ArrowFunctionExpression" ||
      !arg.body ||
      arg.body.type !== "BlockStatement" ||
      !arg.params ||
      arg.params.length < 1
    ) {
      return false;
    }

    let shouldBreak = false;
    argPath.each((paramPath) => {
      const printed = concat([print(paramPath)]);
      shouldBreak = shouldBreak || willBreak(printed);
    }, "params");

    return shouldBreak;
  }

  let anyArgEmptyLine = false;
  let shouldBreakForArrowFunction = false;
  let hasEmptyLineFollowingFirstArg = false;
  const lastArgIndex = args.length - 1;
  const printArgument = (argPath, index) => {
    const arg = argPath.getNode();
    const parts = [print(argPath)];

    if (index === lastArgIndex) {
      // do nothing
    } else if (isNextLineEmpty(options.originalText, arg, options.locEnd)) {
      if (index === 0) {
        hasEmptyLineFollowingFirstArg = true;
      }

      anyArgEmptyLine = true;
      parts.push(",", hardline, hardline);
    } else {
      parts.push(",", line);
    }

    shouldBreakForArrowFunction = shouldBreakForArrowFunctionInArguments(
      arg,
      argPath
    );

    return concat(parts);
  };
  const printedArguments = isDynamicImport
    ? [path.call((path) => printArgument(path, 0), "source")]
    : path.map(printArgument, "arguments");

  const maybeTrailingComma =
    // Dynamic imports cannot have trailing commas
    !(isDynamicImport || (node.callee && node.callee.type === "Import")) &&
    shouldPrintComma(options, "all")
      ? ","
      : "";

  function allArgsBrokenOut() {
    return group(
      concat([
        "(",
        indent(concat([line, concat(printedArguments)])),
        maybeTrailingComma,
        line,
        ")",
      ]),
      { shouldBreak: true }
    );
  }

  if (
    path.getParentNode().type !== "Decorator" &&
    isFunctionCompositionArgs(args)
  ) {
    return allArgsBrokenOut();
  }

  const shouldGroupFirst = shouldGroupFirstArg(args);
  const shouldGroupLast = shouldGroupLastArg(args);
  if (shouldGroupFirst || shouldGroupLast) {
    const shouldBreak =
      (shouldGroupFirst
        ? printedArguments.slice(1).some(willBreak)
        : printedArguments.slice(0, -1).some(willBreak)) ||
      anyArgEmptyLine ||
      shouldBreakForArrowFunction;

    // We want to print the last argument with a special flag
    let printedExpanded;
    let i = 0;
    const printArgument = (argPath) => {
      if (shouldGroupFirst && i === 0) {
        printedExpanded = [
          concat([
            argPath.call((p) => print(p, { expandFirstArg: true })),
            printedArguments.length > 1 ? "," : "",
            hasEmptyLineFollowingFirstArg ? hardline : line,
            hasEmptyLineFollowingFirstArg ? hardline : "",
          ]),
        ].concat(printedArguments.slice(1));
      }
      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = printedArguments
          .slice(0, -1)
          .concat(argPath.call((p) => print(p, { expandLastArg: true })));
      }
      i++;
    };

    if (isDynamicImport) {
      path.call(printArgument, "source");
    } else {
      path.each(printArgument, "arguments");
    }

    const somePrintedArgumentsWillBreak = printedArguments.some(willBreak);

    const simpleConcat = concat(["(", concat(printedExpanded), ")"]);

    return concat([
      somePrintedArgumentsWillBreak ? breakParent : "",
      conditionalGroup(
        [
          !somePrintedArgumentsWillBreak &&
          !node.typeArguments &&
          !node.typeParameters
            ? simpleConcat
            : ifBreak(allArgsBrokenOut(), simpleConcat),
          shouldGroupFirst
            ? concat([
                "(",
                group(printedExpanded[0], { shouldBreak: true }),
                concat(printedExpanded.slice(1)),
                ")",
              ])
            : concat([
                "(",
                concat(printedArguments.slice(0, -1)),
                group(getLast(printedExpanded), {
                  shouldBreak: true,
                }),
                ")",
              ]),
          allArgsBrokenOut(),
        ],
        { shouldBreak }
      ),
    ]);
  }

  const contents = concat([
    "(",
    indent(concat([softline, concat(printedArguments)])),
    ifBreak(maybeTrailingComma),
    softline,
    ")",
  ]);
  if (isLongCurriedCallExpression(path)) {
    // By not wrapping the arguments in a group, the printer prioritizes
    // breaking up these arguments rather than the args of the parent call.
    return contents;
  }

  return group(contents, {
    shouldBreak: printedArguments.some(willBreak) || anyArgEmptyLine,
  });
}

function couldGroupArg(arg) {
  return (
    (arg.type === "ObjectExpression" &&
      (arg.properties.length > 0 || arg.comments)) ||
    (arg.type === "ArrayExpression" &&
      (arg.elements.length > 0 || arg.comments)) ||
    (arg.type === "TSTypeAssertion" && couldGroupArg(arg.expression)) ||
    (arg.type === "TSAsExpression" && couldGroupArg(arg.expression)) ||
    arg.type === "FunctionExpression" ||
    (arg.type === "ArrowFunctionExpression" &&
      // we want to avoid breaking inside composite return types but not simple keywords
      // https://github.com/prettier/prettier/issues/4070
      // export class Thing implements OtherThing {
      //   do: (type: Type) => Provider<Prop> = memoize(
      //     (type: ObjectType): Provider<Opts> => {}
      //   );
      // }
      // https://github.com/prettier/prettier/issues/6099
      // app.get("/", (req, res): void => {
      //   res.send("Hello World!");
      // });
      (!arg.returnType ||
        !arg.returnType.typeAnnotation ||
        arg.returnType.typeAnnotation.type !== "TSTypeReference") &&
      (arg.body.type === "BlockStatement" ||
        arg.body.type === "ArrowFunctionExpression" ||
        arg.body.type === "ObjectExpression" ||
        arg.body.type === "ArrayExpression" ||
        arg.body.type === "CallExpression" ||
        arg.body.type === "OptionalCallExpression" ||
        arg.body.type === "ConditionalExpression" ||
        isJSXNode(arg.body)))
  );
}

function shouldGroupLastArg(args) {
  const lastArg = getLast(args);
  const penultimateArg = getPenultimate(args);
  return (
    !hasLeadingComment(lastArg) &&
    !hasTrailingComment(lastArg) &&
    couldGroupArg(lastArg) &&
    // If the last two arguments are of the same type,
    // disable last element expansion.
    (!penultimateArg || penultimateArg.type !== lastArg.type)
  );
}

function shouldGroupFirstArg(args) {
  if (args.length !== 2) {
    return false;
  }

  const [firstArg, secondArg] = args;
  return (
    (!firstArg.comments || !firstArg.comments.length) &&
    (firstArg.type === "FunctionExpression" ||
      (firstArg.type === "ArrowFunctionExpression" &&
        firstArg.body.type === "BlockStatement")) &&
    secondArg.type !== "FunctionExpression" &&
    secondArg.type !== "ArrowFunctionExpression" &&
    secondArg.type !== "ConditionalExpression" &&
    !couldGroupArg(secondArg)
  );
}

module.exports = printCallArguments;
