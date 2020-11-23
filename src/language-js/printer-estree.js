"use strict";

/** @typedef {import("../document").Doc} Doc */

/** @type {import("assert")} */
const assert = require("assert");

// TODO(azz): anything that imports from main shouldn't be in a `language-*` dir.
const comments = require("../main/comments");
const {
  hasNewline,
  hasNewlineInRange,
  getLast,
  printString,
  printNumber,
  isNextLineEmpty,
} = require("../common/util");
const {
  builders: {
    concat,
    join,
    line,
    hardline,
    softline,
    literalline,
    group,
    indent,
    align,
    conditionalGroup,
    ifBreak,
  },
  utils: { isEmpty },
} = require("../document");
const embed = require("./embed");
const clean = require("./clean");
const { insertPragma } = require("./pragma");
const handleComments = require("./comments");
const pathNeedsParens = require("./needs-parens");
const preprocess = require("./print-preprocess");
const {
  getCallArguments,
  getParentExportDeclaration,
  getTypeScriptMappedTypeModifier,
  hasDanglingComments,
  hasFlowShorthandAnnotationComment,
  hasLeadingOwnLineComment,
  hasNewlineBetweenOrAfterDecorators,
  hasPrettierIgnore,
  hasTrailingComment,
  isExportDeclaration,
  isFunctionNotation,
  isGetterOrSetter,
  isLiteral,
  isObjectType,
  isObjectTypePropertyAFunction,
  isTheOnlyJSXElementInMarkdown,
  isBlockComment,
  needsHardlineAfterDanglingComment,
  rawText,
  shouldPrintComma,
} = require("./utils");
const { locStart, locEnd } = require("./loc");

const {
  printHtmlBinding,
  isVueEventBindingExpression,
} = require("./print/html-binding");
const { printAngular } = require("./print/angular");
const { printJsx } = require("./print/jsx");
const {
  printOptionalToken,
  printBindExpressionCallee,
  printTypeScriptModifiers,
  printDecorators,
  printFlowDeclaration,
  adjustClause,
} = require("./print/misc");
const {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSpecifier,
} = require("./print/module");
const printTernaryOperator = require("./print/ternary");
const { printFunctionParameters } = require("./print/function-parameters");
const { printTemplateLiteral } = require("./print/template-literal");
const { printArray, printArrayItems } = require("./print/array");
const { printObject } = require("./print/object");
const {
  printTypeAnnotation,
  shouldHugType,
} = require("./print/type-annotation");
const { printClass, printClassMethod } = require("./print/class");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./print/type-parameters");
const { printPropertyKey } = require("./print/property");
const {
  printFunctionDeclaration,
  printArrowFunctionExpression,
  printMethod,
  printReturnAndThrowArgument,
} = require("./print/function");
const { printCallExpression } = require("./print/call-expression");
const { printInterface } = require("./print/interface");
const {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
  printAssignmentRight,
} = require("./print/assignment");
const { printBinaryishExpression } = require("./print/binaryish");
const { printStatementSequence } = require("./print/statement");
const { printMemberExpression } = require("./print/member");
const { printBlock } = require("./print/block");
const { printComment } = require("./print/comment");

function genericPrint(path, options, printPath, args) {
  const node = path.getValue();
  let needsParens = false;
  const linesWithoutParens = printPathNoParens(path, options, printPath, args);

  if (!node || isEmpty(linesWithoutParens)) {
    return linesWithoutParens;
  }

  const parentExportDecl = getParentExportDeclaration(path);
  const decorators = [];
  if (
    node.type === "ClassMethod" ||
    node.type === "ClassPrivateMethod" ||
    node.type === "ClassProperty" ||
    node.type === "FieldDefinition" ||
    node.type === "TSAbstractClassProperty" ||
    node.type === "ClassPrivateProperty" ||
    node.type === "MethodDefinition" ||
    node.type === "TSAbstractMethodDefinition" ||
    node.type === "TSDeclareMethod"
  ) {
    // their decorators are handled themselves
  } else if (
    node.decorators &&
    node.decorators.length > 0 &&
    // If the parent node is an export declaration and the decorator
    // was written before the export, the export will be responsible
    // for printing the decorators.
    !(
      parentExportDecl &&
      locStart(parentExportDecl, { ignoreDecorators: true }) >
        locStart(node.decorators[0])
    )
  ) {
    const shouldBreak =
      node.type === "ClassExpression" ||
      node.type === "ClassDeclaration" ||
      hasNewlineBetweenOrAfterDecorators(node, options);

    const separator = shouldBreak ? hardline : line;

    path.each((decoratorPath) => {
      let decorator = decoratorPath.getValue();
      if (decorator.expression) {
        decorator = decorator.expression;
      } else {
        decorator = decorator.callee;
      }

      decorators.push(printPath(decoratorPath), separator);
    }, "decorators");

    if (parentExportDecl) {
      decorators.unshift(hardline);
    }
  } else if (
    isExportDeclaration(node) &&
    node.declaration &&
    node.declaration.decorators &&
    node.declaration.decorators.length > 0 &&
    // Only print decorators here if they were written before the export,
    // otherwise they are printed by the node.declaration
    locStart(node, { ignoreDecorators: true }) >
      locStart(node.declaration.decorators[0])
  ) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    path.each(
      (decoratorPath) => {
        const decorator = decoratorPath.getValue();
        const prefix = decorator.type === "Decorator" ? "" : "@";
        decorators.push(prefix, printPath(decoratorPath), hardline);
      },
      "declaration",
      "decorators"
    );
  } else {
    // Nodes with decorators can't have parentheses, so we can avoid
    // computing pathNeedsParens() except in this case.
    needsParens = pathNeedsParens(path, options);
  }

  const parts = [];
  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    const node = path.getValue();
    if (hasFlowShorthandAnnotationComment(node)) {
      parts.push(" /*");
      parts.push(node.trailingComments[0].value.trimStart());
      parts.push("*/");
      node.trailingComments[0].printed = true;
    }

    parts.push(")");
  }

  if (decorators.length > 0) {
    return group(concat(decorators.concat(parts)));
  }
  return concat(parts);
}

function printPathNoParens(path, options, print, args) {
  const n = path.getValue();
  const semi = options.semi ? ";" : "";

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  const htmlBinding = printHtmlBinding(path, options, print);
  if (htmlBinding) {
    return htmlBinding;
  }

  const printedAngular = printAngular(path, options, print);
  if (typeof printedAngular !== "undefined") {
    return printedAngular;
  }

  const printedJsx = printJsx(path, options, print);
  if (typeof printedJsx !== "undefined") {
    return printedJsx;
  }

  /** @type{Doc[]} */
  let parts = [];

  switch (n.type) {
    case "JsExpressionRoot":
      return path.call(print, "node");
    case "JsonRoot":
      return concat([path.call(print, "node"), hardline]);
    case "File":
      // Print @babel/parser's InterpreterDirective here so that
      // leading comments on the `Program` node get printed after the hashbang.
      if (n.program && n.program.interpreter) {
        parts.push(
          path.call(
            (programPath) => programPath.call(print, "interpreter"),
            "program"
          )
        );
      }

      parts.push(path.call(print, "program"));

      return concat(parts);

    case "Program": {
      const hasContents =
        !n.body.every(({ type }) => type === "EmptyStatement") || n.comments;

      // Babel 6
      if (n.directives) {
        const directivesCount = n.directives.length;
        path.each((childPath, index) => {
          parts.push(print(childPath), semi, hardline);
          if (
            (index < directivesCount - 1 || hasContents) &&
            isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)
          ) {
            parts.push(hardline);
          }
        }, "directives");
      }

      parts.push(
        path.call((bodyPath) => {
          return printStatementSequence(bodyPath, options, print);
        }, "body")
      );

      parts.push(
        comments.printDanglingComments(path, options, /* sameIndent */ true)
      );

      // Only force a trailing newline if there were any contents.
      if (hasContents) {
        parts.push(hardline);
      }

      return concat(parts);
    }
    // Babel extension.
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      // Detect Flow and TypeScript directives
      if (n.directive) {
        return concat([nodeStr(n.expression, options, true), semi]);
      }

      if (options.parser === "__vue_event_binding") {
        const parent = path.getParentNode();
        if (
          parent.type === "Program" &&
          parent.body.length === 1 &&
          parent.body[0] === n
        ) {
          return concat([
            path.call(print, "expression"),
            isVueEventBindingExpression(n.expression) ? ";" : "",
          ]);
        }
      }

      // Do not append semicolon after the only JSX element in a program
      return concat([
        path.call(print, "expression"),
        isTheOnlyJSXElementInMarkdown(options, path) ? "" : semi,
      ]);
    // Babel non-standard node. Used for Closure-style type casts. See postprocess.js.
    case "ParenthesizedExpression": {
      const shouldHug = !n.expression.comments;
      if (shouldHug) {
        return concat(["(", path.call(print, "expression"), ")"]);
      }
      return group(
        concat([
          "(",
          indent(concat([softline, path.call(print, "expression")])),
          softline,
          ")",
        ])
      );
    }
    case "AssignmentExpression":
      return printAssignmentExpression(path, options, print);
    case "VariableDeclarator":
      return printVariableDeclarator(path, options, print);
    case "BinaryExpression":
    case "LogicalExpression":
      return printBinaryishExpression(path, options, print);
    case "AssignmentPattern":
      return concat([
        path.call(print, "left"),
        " = ",
        path.call(print, "right"),
      ]);
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression"
      );

      const castGroup = group(
        concat([
          "<",
          indent(concat([softline, path.call(print, "typeAnnotation")])),
          softline,
          ">",
        ])
      );

      const exprContents = concat([
        ifBreak("("),
        indent(concat([softline, path.call(print, "expression")])),
        softline,
        ifBreak(")"),
      ]);

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          concat([castGroup, path.call(print, "expression")]),
          concat([castGroup, group(exprContents, { shouldBreak: true })]),
          concat([castGroup, path.call(print, "expression")]),
        ]);
      }
      return group(concat([castGroup, path.call(print, "expression")]));
    }
    case "OptionalMemberExpression":
    case "MemberExpression": {
      return printMemberExpression(path, options, print);
    }
    case "MetaProperty":
      return concat([
        path.call(print, "meta"),
        ".",
        path.call(print, "property"),
      ]);
    case "BindExpression":
      if (n.object) {
        parts.push(path.call(print, "object"));
      }

      parts.push(
        group(
          indent(
            concat([softline, printBindExpressionCallee(path, options, print)])
          )
        )
      );

      return concat(parts);
    case "Identifier": {
      return concat([
        n.name,
        printOptionalToken(path),
        printTypeAnnotation(path, options, print),
      ]);
    }
    case "V8IntrinsicIdentifier":
      return concat(["%", n.name]);
    case "SpreadElement":
    case "SpreadElementPattern":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return concat([
        "...",
        path.call(print, "argument"),
        printTypeAnnotation(path, options, print),
      ]);
    case "FunctionDeclaration":
    case "FunctionExpression":
      parts.push(
        printFunctionDeclaration(
          path,
          print,
          options,
          args &&
            args.expandLastArg &&
            getCallArguments(path.getParentNode()).length > 1
        )
      );
      if (!n.body) {
        parts.push(semi);
      }
      return concat(parts);
    case "ArrowFunctionExpression":
      return printArrowFunctionExpression(path, options, print, args);
    case "YieldExpression":
      parts.push("yield");

      if (n.delegate) {
        parts.push("*");
      }
      if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }

      return concat(parts);
    case "AwaitExpression": {
      parts.push("await");
      if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }
      const parent = path.getParentNode();
      if (
        ((parent.type === "CallExpression" ||
          parent.type === "OptionalCallExpression") &&
          parent.callee === n) ||
        ((parent.type === "MemberExpression" ||
          parent.type === "OptionalMemberExpression") &&
          parent.object === n)
      ) {
        return group(
          concat([indent(concat([softline, concat(parts)])), softline])
        );
      }
      return concat(parts);
    }
    case "TSExportAssignment":
      return concat(["export = ", path.call(print, "expression"), semi]);
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
    case "DeclareExportDeclaration":
      return printExportDeclaration(path, options, print);
    case "ExportAllDeclaration":
    case "DeclareExportAllDeclaration":
      return printExportAllDeclaration(path, options, print);
    case "ImportDeclaration":
      return printImportDeclaration(path, options, print);
    case "ImportSpecifier":
    case "ExportSpecifier":
    case "ImportNamespaceSpecifier":
    case "ExportNamespaceSpecifier":
    case "ImportDefaultSpecifier":
    case "ExportDefaultSpecifier":
      return printModuleSpecifier(path, options, print);
    case "ImportAttribute":
      return concat([path.call(print, "key"), ": ", path.call(print, "value")]);
    case "Import":
      return "import";
    case "TSModuleBlock":
    case "BlockStatement":
    case "StaticBlock":
      return printBlock(path, options, print);
    case "ThrowStatement":
    case "ReturnStatement":
      return concat([
        n.type === "ReturnStatement" ? "return" : "throw",
        printReturnAndThrowArgument(path, options, print),
      ]);
    case "NewExpression":
    case "ImportExpression":
    case "OptionalCallExpression":
    case "CallExpression":
      return printCallExpression(path, options, print);
    case "ObjectTypeInternalSlot":
      return concat([
        n.static ? "static " : "",
        "[[",
        path.call(print, "id"),
        "]]",
        printOptionalToken(path),
        n.method ? "" : ": ",
        path.call(print, "value"),
      ]);

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "TSInterfaceBody":
    case "TSTypeLiteral":
    case "RecordExpression":
      return printObject(path, options, print);
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path, options, print);
      }

      if (n.shorthand) {
        parts.push(path.call(print, "value"));
      } else {
        parts.push(
          printAssignment(
            n.key,
            printPropertyKey(path, options, print),
            ":",
            n.value,
            path.call(print, "value"),
            options
          )
        );
      }

      return concat(parts); // Babel 6
    case "ClassMethod":
    case "ClassPrivateMethod":
    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "ObjectMethod":
      return printMethod(path, options, print);
    case "Decorator":
      return concat([
        "@",
        path.call(print, "expression"),
        path.call(print, "callee"),
      ]);
    case "ArrayExpression":
    case "ArrayPattern":
    case "TupleExpression":
      return printArray(path, options, print);
    case "SequenceExpression": {
      const parent = path.getParentNode(0);
      if (
        parent.type === "ExpressionStatement" ||
        parent.type === "ForStatement"
      ) {
        // For ExpressionStatements and for-loop heads, which are among
        // the few places a SequenceExpression appears unparenthesized, we want
        // to indent expressions after the first.
        const parts = [];
        path.each((p) => {
          if (p.getName() === 0) {
            parts.push(print(p));
          } else {
            parts.push(",", indent(concat([line, print(p)])));
          }
        }, "expressions");
        return group(concat(parts));
      }
      return group(
        concat([join(concat([",", line]), path.map(print, "expressions"))])
      );
    }
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "NullLiteral": // Babel 6 Literal split
      return "null";
    case "RegExpLiteral": // Babel 6 Literal split
      return printRegex(n);
    case "NumericLiteral": // Babel 6 Literal split
      return printNumber(n.extra.raw);
    case "DecimalLiteral":
      return printNumber(n.value) + "m";
    case "BigIntLiteral":
      // babel: n.extra.raw, flow: n.bigint
      return (n.bigint || n.extra.raw).toLowerCase();
    case "BooleanLiteral": // Babel 6 Literal split
    case "StringLiteral": // Babel 6 Literal split
    case "Literal":
      if (n.regex) {
        return printRegex(n.regex);
      }
      // typescript
      if (n.bigint) {
        return n.raw.toLowerCase();
      }
      if (typeof n.value === "number") {
        return printNumber(n.raw);
      }
      if (typeof n.value !== "string") {
        return "" + n.value;
      }
      return nodeStr(n, options);
    case "Directive":
      return path.call(print, "value"); // Babel 6
    case "DirectiveLiteral":
      return nodeStr(n, options);
    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) {
        parts.push(" ");
      }

      if (n.argument.comments && n.argument.comments.length > 0) {
        parts.push(
          group(
            concat([
              "(",
              indent(concat([softline, path.call(print, "argument")])),
              softline,
              ")",
            ])
          )
        );
      } else {
        parts.push(path.call(print, "argument"));
      }

      return concat(parts);
    case "UpdateExpression":
      parts.push(path.call(print, "argument"), n.operator);

      if (n.prefix) {
        parts.reverse();
      }

      return concat(parts);
    case "ConditionalExpression":
      return printTernaryOperator(path, options, print, {
        beforeParts: () => [path.call(print, "test")],
        afterParts: (breakClosingParen) => [breakClosingParen ? softline : ""],
        shouldCheckJsx: true,
        conditionalNodeType: "ConditionalExpression",
        consequentNodePropertyName: "consequent",
        alternateNodePropertyName: "alternate",
        testNodePropertyNames: ["test"],
      });
    case "VariableDeclaration": {
      const printed = path.map((childPath) => {
        return print(childPath);
      }, "declarations");

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      const parentNode = path.getParentNode();

      const isParentForLoop =
        parentNode.type === "ForStatement" ||
        parentNode.type === "ForInStatement" ||
        parentNode.type === "ForOfStatement";

      const hasValue = n.declarations.some((decl) => decl.init);

      let firstVariable;
      if (printed.length === 1 && !n.declarations[0].comments) {
        firstVariable = printed[0];
      } else if (printed.length > 0) {
        // Indent first var to comply with eslint one-var rule
        firstVariable = indent(printed[0]);
      }

      parts = [
        n.declare ? "declare " : "",
        n.kind,
        firstVariable ? concat([" ", firstVariable]) : "",
        indent(
          concat(
            printed
              .slice(1)
              .map((p) =>
                concat([",", hasValue && !isParentForLoop ? hardline : line, p])
              )
          )
        ),
      ];

      if (!(isParentForLoop && parentNode.body !== n)) {
        parts.push(semi);
      }

      return group(concat(parts));
    }
    case "TSTypeAliasDeclaration": {
      if (n.declare) {
        parts.push("declare ");
      }

      const printed = printAssignmentRight(
        n.id,
        n.typeAnnotation,
        n.typeAnnotation && path.call(print, "typeAnnotation"),
        options
      );

      parts.push(
        "type ",
        path.call(print, "id"),
        path.call(print, "typeParameters"),
        " =",
        printed,
        semi
      );

      return group(concat(parts));
    }
    case "WithStatement":
      return group(
        concat([
          "with (",
          path.call(print, "object"),
          ")",
          adjustClause(n.body, path.call(print, "body")),
        ])
      );
    case "IfStatement": {
      const con = adjustClause(n.consequent, path.call(print, "consequent"));
      const opening = group(
        concat([
          "if (",
          group(
            concat([
              indent(concat([softline, path.call(print, "test")])),
              softline,
            ])
          ),
          ")",
          con,
        ])
      );

      parts.push(opening);

      if (n.alternate) {
        const commentOnOwnLine =
          (hasTrailingComment(n.consequent) &&
            n.consequent.comments.some(
              (comment) => comment.trailing && !isBlockComment(comment)
            )) ||
          needsHardlineAfterDanglingComment(n);
        const elseOnSameLine =
          n.consequent.type === "BlockStatement" && !commentOnOwnLine;
        parts.push(elseOnSameLine ? " " : hardline);

        if (hasDanglingComments(n)) {
          parts.push(
            comments.printDanglingComments(path, options, true),
            commentOnOwnLine ? hardline : " "
          );
        }

        parts.push(
          "else",
          group(
            adjustClause(
              n.alternate,
              path.call(print, "alternate"),
              n.alternate.type === "IfStatement"
            )
          )
        );
      }

      return concat(parts);
    }
    case "ForStatement": {
      const body = adjustClause(n.body, path.call(print, "body"));

      // We want to keep dangling comments above the loop to stay consistent.
      // Any comment positioned between the for statement and the parentheses
      // is going to be printed before the statement.
      const dangling = comments.printDanglingComments(
        path,
        options,
        /* sameLine */ true
      );
      const printedComments = dangling ? concat([dangling, softline]) : "";

      if (!n.init && !n.test && !n.update) {
        return concat([printedComments, group(concat(["for (;;)", body]))]);
      }

      return concat([
        printedComments,
        group(
          concat([
            "for (",
            group(
              concat([
                indent(
                  concat([
                    softline,
                    path.call(print, "init"),
                    ";",
                    line,
                    path.call(print, "test"),
                    ";",
                    line,
                    path.call(print, "update"),
                  ])
                ),
                softline,
              ])
            ),
            ")",
            body,
          ])
        ),
      ]);
    }
    case "WhileStatement":
      return group(
        concat([
          "while (",
          group(
            concat([
              indent(concat([softline, path.call(print, "test")])),
              softline,
            ])
          ),
          ")",
          adjustClause(n.body, path.call(print, "body")),
        ])
      );
    case "ForInStatement":
      return group(
        concat([
          "for (",
          path.call(print, "left"),
          " in ",
          path.call(print, "right"),
          ")",
          adjustClause(n.body, path.call(print, "body")),
        ])
      );

    case "ForOfStatement":
      return group(
        concat([
          "for",
          n.await ? " await" : "",
          " (",
          path.call(print, "left"),
          " of ",
          path.call(print, "right"),
          ")",
          adjustClause(n.body, path.call(print, "body")),
        ])
      );

    case "DoWhileStatement": {
      const clause = adjustClause(n.body, path.call(print, "body"));
      const doBody = group(concat(["do", clause]));
      parts = [doBody];

      if (n.body.type === "BlockStatement") {
        parts.push(" ");
      } else {
        parts.push(hardline);
      }
      parts.push("while (");

      parts.push(
        group(
          concat([
            indent(concat([softline, path.call(print, "test")])),
            softline,
          ])
        ),
        ")",
        semi
      );

      return concat(parts);
    }
    case "DoExpression":
      return concat(["do ", path.call(print, "body")]);
    case "BreakStatement":
      parts.push("break");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return concat(parts);
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return concat(parts);
    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return concat([path.call(print, "label"), ":;"]);
      }

      return concat([
        path.call(print, "label"),
        ": ",
        path.call(print, "body"),
      ]);
    case "TryStatement":
      return concat([
        "try ",
        path.call(print, "block"),
        n.handler ? concat([" ", path.call(print, "handler")]) : "",
        n.finalizer ? concat([" finally ", path.call(print, "finalizer")]) : "",
      ]);
    case "CatchClause":
      if (n.param) {
        const hasComments =
          n.param.comments &&
          n.param.comments.some(
            (comment) =>
              !isBlockComment(comment) ||
              (comment.leading &&
                hasNewline(options.originalText, locEnd(comment))) ||
              (comment.trailing &&
                hasNewline(options.originalText, locStart(comment), {
                  backwards: true,
                }))
          );
        const param = path.call(print, "param");

        return concat([
          "catch ",
          hasComments
            ? concat(["(", indent(concat([softline, param])), softline, ") "])
            : concat(["(", param, ") "]),
          path.call(print, "body"),
        ]);
      }

      return concat(["catch ", path.call(print, "body")]);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return concat([
        group(
          concat([
            "switch (",
            indent(concat([softline, path.call(print, "discriminant")])),
            softline,
            ")",
          ])
        ),
        " {",
        n.cases.length > 0
          ? indent(
              concat([
                hardline,
                join(
                  hardline,
                  path.map((casePath) => {
                    const caseNode = casePath.getValue();
                    return concat([
                      casePath.call(print),
                      n.cases.indexOf(caseNode) !== n.cases.length - 1 &&
                      isNextLineEmpty(options.originalText, caseNode, locEnd)
                        ? hardline
                        : "",
                    ]);
                  }, "cases")
                ),
              ])
            )
          : "",
        hardline,
        "}",
      ]);
    case "SwitchCase": {
      if (n.test) {
        parts.push("case ", path.call(print, "test"), ":");
      } else {
        parts.push("default:");
      }

      const consequent = n.consequent.filter(
        (node) => node.type !== "EmptyStatement"
      );

      if (consequent.length > 0) {
        const cons = path.call((consequentPath) => {
          return printStatementSequence(consequentPath, options, print);
        }, "consequent");

        parts.push(
          consequent.length === 1 && consequent[0].type === "BlockStatement"
            ? concat([" ", cons])
            : indent(concat([hardline, cons]))
        );
      }

      return concat(parts);
    }
    // JSX extensions below.
    case "DebuggerStatement":
      return concat(["debugger", semi]);
    case "TSQualifiedName":
      return join(".", [path.call(print, "left"), path.call(print, "right")]);
    case "ClassBody":
      if (!n.comments && n.body.length === 0) {
        return "{}";
      }

      return concat([
        "{",
        n.body.length > 0
          ? indent(
              concat([
                hardline,
                path.call((bodyPath) => {
                  return printStatementSequence(bodyPath, options, print);
                }, "body"),
              ])
            )
          : comments.printDanglingComments(path, options),
        hardline,
        "}",
      ]);
    case "ClassProperty":
    case "FieldDefinition":
    case "TSAbstractClassProperty":
    case "ClassPrivateProperty": {
      if (n.decorators && n.decorators.length !== 0) {
        parts.push(printDecorators(path, options, print));
      }
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.declare) {
        parts.push("declare ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.type === "TSAbstractClassProperty" || n.abstract) {
        parts.push("abstract ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }
      if (n.variance) {
        parts.push(path.call(print, "variance"));
      }
      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        printTypeAnnotation(path, options, print)
      );
      if (n.value) {
        parts.push(
          " =",
          printAssignmentRight(
            n.key,
            n.value,
            path.call(print, "value"),
            options
          )
        );
      }

      parts.push(semi);

      return group(concat(parts));
    }
    case "ClassDeclaration":
    case "ClassExpression":
      if (n.declare) {
        parts.push("declare ");
      }
      parts.push(printClass(path, options, print));
      return concat(parts);
    case "TSInterfaceHeritage":
    case "TSExpressionWithTypeArguments": // Babel AST
      parts.push(path.call(print, "expression"));

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return concat(parts);
    case "TemplateElement":
      return join(literalline, n.value.raw.split(/\r?\n/g));
    case "TSTemplateLiteralType":
    case "TemplateLiteral": {
      return printTemplateLiteral(path, print, options);
    }
    case "TaggedTemplateExpression":
      return concat([
        path.call(print, "tag"),
        path.call(print, "typeParameters"),
        path.call(print, "quasi"),
      ]);
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.
    case "Node":
    case "Printable":
    case "SourceLocation":
    case "Position":
    case "Statement":
    case "Function":
    case "Pattern":
    case "Expression":
    case "Declaration":
    case "Specifier":
    case "NamedSpecifier":
    case "Comment":
    case "MemberTypeAnnotation": // Flow
    case "Type":
      /* istanbul ignore next */
      throw new Error("unprintable type: " + JSON.stringify(n.type));
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.
    case "TypeAnnotation":
    case "TSTypeAnnotation":
      if (n.typeAnnotation) {
        return path.call(print, "typeAnnotation");
      }

      /* istanbul ignore next */
      return "";
    case "TSNamedTupleMember":
      return concat([
        path.call(print, "label"),
        n.optional ? "?" : "",
        ": ",
        path.call(print, "elementType"),
      ]);
    case "TSTupleType":
    case "TupleTypeAnnotation": {
      const typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
      return group(
        concat([
          "[",
          indent(
            concat([
              softline,
              printArrayItems(path, options, typesField, print),
            ])
          ),
          ifBreak(shouldPrintComma(options, "all") ? "," : ""),
          comments.printDanglingComments(path, options, /* sameIndent */ true),
          softline,
          "]",
        ])
      );
    }

    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return concat([path.call(print, "elementType"), "[]"]);
    case "BooleanLiteralTypeAnnotation":
      return "" + n.value;
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
    case "TSDeclareFunction":
      // For TypeScript the TSDeclareFunction node shares the AST
      // structure with FunctionDeclaration
      return concat([
        n.declare ? "declare " : "",
        printFunctionDeclaration(path, print, options),
        semi,
      ]);
    case "DeclareFunction":
      return printFlowDeclaration(
        path,
        concat([
          "function ",
          path.call(print, "id"),
          n.predicate ? " " : "",
          path.call(print, "predicate"),
          semi,
        ])
      );
    case "DeclareModule":
      return printFlowDeclaration(
        path,
        concat([
          "module ",
          path.call(print, "id"),
          " ",
          path.call(print, "body"),
        ])
      );
    case "DeclareModuleExports":
      return printFlowDeclaration(
        path,
        concat([
          "module.exports",
          ": ",
          path.call(print, "typeAnnotation"),
          semi,
        ])
      );
    case "DeclareVariable":
      return printFlowDeclaration(
        path,
        concat(["var ", path.call(print, "id"), semi])
      );
    case "DeclareOpaqueType":
    case "OpaqueType": {
      parts.push(
        "opaque type ",
        path.call(print, "id"),
        path.call(print, "typeParameters")
      );

      if (n.supertype) {
        parts.push(": ", path.call(print, "supertype"));
      }

      if (n.impltype) {
        parts.push(" = ", path.call(print, "impltype"));
      }

      parts.push(semi);

      if (n.type === "DeclareOpaqueType") {
        return printFlowDeclaration(path, concat(parts));
      }

      return concat(parts);
    }

    case "EnumDeclaration":
      return concat([
        "enum ",
        path.call(print, "id"),
        " ",
        path.call(print, "body"),
      ]);
    case "EnumBooleanBody":
    case "EnumNumberBody":
    case "EnumStringBody":
    case "EnumSymbolBody": {
      if (n.type === "EnumSymbolBody" || n.explicitType) {
        let type = null;
        switch (n.type) {
          case "EnumBooleanBody":
            type = "boolean";
            break;
          case "EnumNumberBody":
            type = "number";
            break;
          case "EnumStringBody":
            type = "string";
            break;
          case "EnumSymbolBody":
            type = "symbol";
            break;
        }
        parts.push("of ", type, " ");
      }
      if (n.members.length === 0 && !n.hasUnknownMembers) {
        parts.push(
          group(
            concat([
              "{",
              comments.printDanglingComments(path, options),
              softline,
              "}",
            ])
          )
        );
      } else {
        const members = n.members.length
          ? [
              hardline,
              printArrayItems(path, options, "members", print),
              n.hasUnknownMembers || shouldPrintComma(options) ? "," : "",
            ]
          : [];

        parts.push(
          group(
            concat([
              "{",
              indent(
                concat([
                  ...members,
                  ...(n.hasUnknownMembers ? [hardline, "..."] : []),
                ])
              ),
              comments.printDanglingComments(
                path,
                options,
                /* sameIndent */ true
              ),
              hardline,
              "}",
            ])
          )
        );
      }
      return concat(parts);
    }
    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumStringMember":
      return concat([
        path.call(print, "id"),
        " = ",
        typeof n.init === "object" ? path.call(print, "init") : String(n.init),
      ]);
    case "EnumDefaultedMember":
      return path.call(print, "id");

    case "FunctionTypeAnnotation":
    case "TSFunctionType": {
      // FunctionTypeAnnotation is ambiguous:
      // declare function foo(a: B): void; OR
      // var A: (a: B) => void;
      const parent = path.getParentNode(0);
      const parentParent = path.getParentNode(1);
      const parentParentParent = path.getParentNode(2);
      let isArrowFunctionTypeAnnotation =
        n.type === "TSFunctionType" ||
        !(
          ((parent.type === "ObjectTypeProperty" ||
            parent.type === "ObjectTypeInternalSlot") &&
            !parent.variance &&
            !parent.optional &&
            locStart(parent) === locStart(n)) ||
          parent.type === "ObjectTypeCallProperty" ||
          (parentParentParent && parentParentParent.type === "DeclareFunction")
        );

      let needsColon =
        isArrowFunctionTypeAnnotation &&
        (parent.type === "TypeAnnotation" ||
          parent.type === "TSTypeAnnotation");

      // Sadly we can't put it inside of FastPath::needsColon because we are
      // printing ":" as part of the expression and it would put parenthesis
      // around :(
      const needsParens =
        needsColon &&
        isArrowFunctionTypeAnnotation &&
        (parent.type === "TypeAnnotation" ||
          parent.type === "TSTypeAnnotation") &&
        parentParent.type === "ArrowFunctionExpression";

      if (isObjectTypePropertyAFunction(parent)) {
        isArrowFunctionTypeAnnotation = true;
        needsColon = true;
      }

      if (needsParens) {
        parts.push("(");
      }

      parts.push(
        printFunctionParameters(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      // The returnType is not wrapped in a TypeAnnotation, so the colon
      // needs to be added separately.
      if (n.returnType || n.predicate || n.typeAnnotation) {
        parts.push(
          isArrowFunctionTypeAnnotation ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "predicate"),
          path.call(print, "typeAnnotation")
        );
      }
      if (needsParens) {
        parts.push(")");
      }

      return group(concat(parts));
    }
    case "TSRestType":
      return concat(["...", path.call(print, "typeAnnotation")]);
    case "TSOptionalType":
      return concat([path.call(print, "typeAnnotation"), "?"]);
    case "FunctionTypeParam": {
      const name = n.name
        ? path.call(print, "name")
        : path.getParentNode().this === n
        ? "this"
        : "";
      return concat([
        name,
        printOptionalToken(path),
        name ? ": " : "",
        path.call(print, "typeAnnotation"),
      ]);
    }

    case "DeclareInterface":
    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "ClassImplements":
    case "InterfaceExtends":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters"),
      ]);
    case "TSClassImplements":
      return concat([
        path.call(print, "expression"),
        path.call(print, "typeParameters"),
      ]);
    case "TSIntersectionType":
    case "IntersectionTypeAnnotation": {
      const types = path.map(print, "types");
      const result = [];
      let wasIndented = false;
      for (let i = 0; i < types.length; ++i) {
        if (i === 0) {
          result.push(types[i]);
        } else if (isObjectType(n.types[i - 1]) && isObjectType(n.types[i])) {
          // If both are objects, don't indent
          result.push(
            concat([" & ", wasIndented ? indent(types[i]) : types[i]])
          );
        } else if (!isObjectType(n.types[i - 1]) && !isObjectType(n.types[i])) {
          // If no object is involved, go to the next line if it breaks
          result.push(indent(concat([" &", line, types[i]])));
        } else {
          // If you go from object to non-object or vis-versa, then inline it
          if (i > 1) {
            wasIndented = true;
          }
          result.push(" & ", i > 1 ? indent(types[i]) : types[i]);
        }
      }
      return group(concat(result));
    }
    case "TSUnionType":
    case "UnionTypeAnnotation": {
      // single-line variation
      // A | B | C

      // multi-line variation
      // | A
      // | B
      // | C

      const parent = path.getParentNode();

      // If there's a leading comment, the parent is doing the indentation
      const shouldIndent =
        parent.type !== "TypeParameterInstantiation" &&
        parent.type !== "TSTypeParameterInstantiation" &&
        parent.type !== "GenericTypeAnnotation" &&
        parent.type !== "TSTypeReference" &&
        parent.type !== "TSTypeAssertion" &&
        parent.type !== "TupleTypeAnnotation" &&
        parent.type !== "TSTupleType" &&
        !(
          parent.type === "FunctionTypeParam" &&
          !parent.name &&
          path.getParentNode(1).this !== parent
        ) &&
        !(
          (parent.type === "TypeAlias" ||
            parent.type === "VariableDeclarator" ||
            parent.type === "TSTypeAliasDeclaration") &&
          hasLeadingOwnLineComment(options.originalText, n)
        );

      // {
      //   a: string
      // } | null | void
      // should be inlined and not be printed in the multi-line variant
      const shouldHug = shouldHugType(n);

      // We want to align the children but without its comment, so it looks like
      // | child1
      // // comment
      // | child2
      const printed = path.map((typePath) => {
        let printedType = typePath.call(print);
        if (!shouldHug) {
          printedType = align(2, printedType);
        }
        return comments.printComments(typePath, () => printedType, options);
      }, "types");

      if (shouldHug) {
        return join(" | ", printed);
      }

      const shouldAddStartLine =
        shouldIndent && !hasLeadingOwnLineComment(options.originalText, n);

      const code = concat([
        ifBreak(concat([shouldAddStartLine ? line : "", "| "])),
        join(concat([line, "| "]), printed),
      ]);

      if (pathNeedsParens(path, options)) {
        return group(concat([indent(code), softline]));
      }

      if (
        (parent.type === "TupleTypeAnnotation" && parent.types.length > 1) ||
        (parent.type === "TSTupleType" && parent.elementTypes.length > 1)
      ) {
        return group(
          concat([
            indent(concat([ifBreak(concat(["(", softline])), code])),
            softline,
            ifBreak(")"),
          ])
        );
      }

      return group(shouldIndent ? indent(code) : code);
    }
    case "NullableTypeAnnotation":
      return concat(["?", path.call(print, "typeAnnotation")]);
    case "Variance": {
      const { kind } = n;
      assert.ok(kind === "plus" || kind === "minus");
      return kind === "plus" ? "+" : "-";
    }
    case "ObjectTypeCallProperty":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(path.call(print, "value"));

      return concat(parts);
    case "ObjectTypeIndexer": {
      return concat([
        n.variance ? path.call(print, "variance") : "",
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value"),
      ]);
    }
    case "ObjectTypeProperty": {
      let modifier = "";

      if (n.proto) {
        modifier = "proto ";
      } else if (n.static) {
        modifier = "static ";
      }

      return concat([
        modifier,
        isGetterOrSetter(n) ? n.kind + " " : "",
        n.variance ? path.call(print, "variance") : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(n) ? "" : ": ",
        path.call(print, "value"),
      ]);
    }
    case "QualifiedTypeIdentifier":
      return concat([
        path.call(print, "qualification"),
        ".",
        path.call(print, "id"),
      ]);
    case "StringLiteralTypeAnnotation":
      return nodeStr(n, options);
    case "NumberLiteralTypeAnnotation":
      assert.strictEqual(typeof n.value, "number");
    // fall through
    case "BigIntLiteralTypeAnnotation":
      if (n.extra != null) {
        return printNumber(n.extra.raw);
      }
      return printNumber(n.raw);

    case "DeclareTypeAlias":
    case "TypeAlias": {
      if (n.type === "DeclareTypeAlias" || n.declare) {
        parts.push("declare ");
      }

      const printed = printAssignmentRight(
        n.id,
        n.right,
        path.call(print, "right"),
        options
      );

      parts.push(
        "type ",
        path.call(print, "id"),
        path.call(print, "typeParameters"),
        " =",
        printed,
        semi
      );

      return group(concat(parts));
    }
    case "TypeCastExpression": {
      return concat([
        "(",
        path.call(print, "expression"),
        printTypeAnnotation(path, options, print),
        ")",
      ]);
    }

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation": {
      const printed = printTypeParameters(path, options, print, "params");

      if (options.parser === "flow") {
        const start = locStart(n);
        const end = locEnd(n);
        const commentStartIndex = options.originalText.lastIndexOf("/*", start);
        const commentEndIndex = options.originalText.indexOf("*/", end);
        if (commentStartIndex !== -1 && commentEndIndex !== -1) {
          const comment = options.originalText
            .slice(commentStartIndex + 2, commentEndIndex)
            .trim();
          if (
            comment.startsWith("::") &&
            !comment.includes("/*") &&
            !comment.includes("*/")
          ) {
            return concat(["/*:: ", printed, " */"]);
          }
        }
      }

      return printed;
    }

    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return concat(["typeof ", path.call(print, "argument")]);
    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return concat(["%checks(", path.call(print, "value"), ")"]);
    case "TSAbstractKeyword":
      return "abstract";
    case "AnyTypeAnnotation":
    case "TSAnyKeyword":
      return "any";
    case "TSAsyncKeyword":
      return "async";
    case "BooleanTypeAnnotation":
    case "TSBooleanKeyword":
      return "boolean";
    case "BigIntTypeAnnotation":
    case "TSBigIntKeyword":
      return "bigint";
    case "TSConstKeyword":
      return "const";
    case "TSDeclareKeyword":
      return "declare";
    case "TSExportKeyword":
      return "export";
    case "NullLiteralTypeAnnotation":
    case "TSNullKeyword":
      return "null";
    case "TSNeverKeyword":
      return "never";
    case "NumberTypeAnnotation":
    case "TSNumberKeyword":
      return "number";
    case "TSObjectKeyword":
      return "object";
    case "TSProtectedKeyword":
      return "protected";
    case "TSPrivateKeyword":
      return "private";
    case "TSPublicKeyword":
      return "public";
    case "TSReadonlyKeyword":
      return "readonly";
    case "SymbolTypeAnnotation":
    case "TSSymbolKeyword":
      return "symbol";
    case "TSStaticKeyword":
      return "static";
    case "StringTypeAnnotation":
    case "TSStringKeyword":
      return "string";
    case "TSUndefinedKeyword":
      return "undefined";
    case "TSUnknownKeyword":
      return "unknown";
    case "VoidTypeAnnotation":
    case "TSVoidKeyword":
      return "void";
    case "TSAsExpression":
      return concat([
        path.call(print, "expression"),
        " as ",
        path.call(print, "typeAnnotation"),
      ]);
    case "TSArrayType":
      return concat([path.call(print, "elementType"), "[]"]);
    case "TSPropertySignature": {
      if (n.export) {
        parts.push("export ");
      }
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path)
      );

      if (n.typeAnnotation) {
        parts.push(": ");
        parts.push(path.call(print, "typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }

      return concat(parts);
    }
    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.export) {
        parts.push("export ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));

      return concat(parts);
    case "GenericTypeAnnotation":
    case "TSTypeReference":
      return concat([
        path.call(print, n.type === "TSTypeReference" ? "typeName" : "id"),
        printTypeParameters(path, options, print, "typeParameters"),
      ]);
    case "TSTypeQuery":
      return concat(["typeof ", path.call(print, "exprName")]);
    case "TSIndexSignature": {
      const parent = path.getParentNode();

      // The typescript parser accepts multiple parameters here. If you're
      // using them, it makes sense to have a trailing comma. But if you
      // aren't, this is more like a computed property name than an array.
      // So we leave off the trailing comma when there's just one parameter.
      const trailingComma =
        n.parameters.length > 1
          ? ifBreak(shouldPrintComma(options) ? "," : "")
          : "";

      const parametersGroup = group(
        concat([
          indent(
            concat([
              softline,
              join(concat([", ", softline]), path.map(print, "parameters")),
            ])
          ),
          trailingComma,
          softline,
        ])
      );

      return concat([
        n.export ? "export " : "",
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.declare ? "declare " : "",
        "[",
        n.parameters ? parametersGroup : "",
        n.typeAnnotation ? "]: " : "]",
        n.typeAnnotation ? path.call(print, "typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ]);
    }
    case "TSTypePredicate":
      return concat([
        n.asserts ? "asserts " : "",
        path.call(print, "parameterName"),
        n.typeAnnotation
          ? concat([" is ", path.call(print, "typeAnnotation")])
          : "",
      ]);
    case "TSNonNullExpression":
      return concat([path.call(print, "expression"), "!"]);
    case "ThisTypeAnnotation":
    case "TSThisType":
      return "this";
    case "TSImportType":
      return concat([
        !n.isTypeOf ? "" : "typeof ",
        "import(",
        path.call(print, n.parameter ? "parameter" : "argument"),
        ")",
        !n.qualifier ? "" : concat([".", path.call(print, "qualifier")]),
        printTypeParameters(path, options, print, "typeParameters"),
      ]);
    case "TSLiteralType":
      return path.call(print, "literal");
    case "TSIndexedAccessType":
      return concat([
        path.call(print, "objectType"),
        "[",
        path.call(print, "indexType"),
        "]",
      ]);
    case "TSConstructSignatureDeclaration":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType": {
      if (n.type !== "TSCallSignatureDeclaration") {
        parts.push("new ");
      }

      parts.push(
        group(
          printFunctionParameters(
            path,
            print,
            options,
            /* expandArg */ false,
            /* printTypeParams */ true
          )
        )
      );

      if (n.returnType || n.typeAnnotation) {
        const isType = n.type === "TSConstructorType";
        parts.push(
          isType ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return concat(parts);
    }
    case "TSTypeOperator":
      return concat([n.operator, " ", path.call(print, "typeAnnotation")]);
    case "TSMappedType": {
      const shouldBreak = hasNewlineInRange(
        options.originalText,
        locStart(n),
        locEnd(n)
      );
      return group(
        concat([
          "{",
          indent(
            concat([
              options.bracketSpacing ? line : softline,
              n.readonly
                ? concat([
                    getTypeScriptMappedTypeModifier(n.readonly, "readonly"),
                    " ",
                  ])
                : "",
              printTypeScriptModifiers(path, options, print),
              path.call(print, "typeParameter"),
              n.optional
                ? getTypeScriptMappedTypeModifier(n.optional, "?")
                : "",
              n.typeAnnotation ? ": " : "",
              path.call(print, "typeAnnotation"),
              ifBreak(semi, ""),
            ])
          ),
          comments.printDanglingComments(path, options, /* sameIndent */ true),
          options.bracketSpacing ? line : softline,
          "}",
        ]),
        { shouldBreak }
      );
    }
    case "TSMethodSignature":
      parts.push(
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.export ? "export " : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.computed ? "[" : "",
        path.call(print, "key"),
        n.computed ? "]" : "",
        printOptionalToken(path),
        printFunctionParameters(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      if (n.returnType || n.typeAnnotation) {
        parts.push(
          ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return group(concat(parts));
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", path.call(print, "id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSEnumDeclaration":
      if (n.declare) {
        parts.push("declare ");
      }

      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (n.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

      if (n.members.length === 0) {
        parts.push(
          group(
            concat([
              "{",
              comments.printDanglingComments(path, options),
              softline,
              "}",
            ])
          )
        );
      } else {
        parts.push(
          group(
            concat([
              "{",
              indent(
                concat([
                  hardline,
                  printArrayItems(path, options, "members", print),
                  shouldPrintComma(options, "es5") ? "," : "",
                ])
              ),
              comments.printDanglingComments(
                path,
                options,
                /* sameIndent */ true
              ),
              hardline,
              "}",
            ])
          )
        );
      }

      return concat(parts);
    case "TSEnumMember":
      parts.push(path.call(print, "id"));
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }
      return concat(parts);
    case "TSImportEqualsDeclaration":
      if (n.isExport) {
        parts.push("export ");
      }
      parts.push(
        "import ",
        path.call(print, "id"),
        " = ",
        path.call(print, "moduleReference")
      );

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSExternalModuleReference":
      return concat(["require(", path.call(print, "expression"), ")"]);
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(n.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (n.declare) {
          parts.push("declare ");
        }
        parts.push(printTypeScriptModifiers(path, options, print));

        const textBetweenNodeAndItsId = options.originalText.slice(
          locStart(n),
          locStart(n.id)
        );

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          n.id.type === "Identifier" &&
          n.id.name === "global" &&
          !/namespace|module/.test(textBetweenNodeAndItsId);

        if (!isGlobalDeclaration) {
          parts.push(
            isExternalModule ||
              /(^|\s)module(\s|$)/.test(textBetweenNodeAndItsId)
              ? "module "
              : "namespace "
          );
        }
      }

      parts.push(path.call(print, "id"));

      if (bodyIsDeclaration) {
        parts.push(path.call(print, "body"));
      } else if (n.body) {
        parts.push(" ", group(path.call(print, "body")));
      } else {
        parts.push(semi);
      }

      return concat(parts);
    }

    case "PrivateName":
      // babel use `id`, meriyah use `name`
      return concat(["#", path.call(print, n.id ? "id" : "name")]);

    // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
    case "TSPrivateIdentifier":
      return n.escapedText;

    case "TSConditionalType":
      return printTernaryOperator(path, options, print, {
        beforeParts: () => [
          path.call(print, "checkType"),
          " ",
          "extends",
          " ",
          path.call(print, "extendsType"),
        ],
        afterParts: () => [],
        shouldCheckJsx: false,
        conditionalNodeType: "TSConditionalType",
        consequentNodePropertyName: "trueType",
        alternateNodePropertyName: "falseType",
        testNodePropertyNames: ["checkType", "extendsType"],
      });

    case "TSInferType":
      return concat(["infer", " ", path.call(print, "typeParameter")]);

    case "InterpreterDirective":
      parts.push("#!", n.value, hardline);

      if (isNextLineEmpty(options.originalText, n, locEnd)) {
        parts.push(hardline);
      }

      return concat(parts);

    case "PipelineBareFunction":
      return path.call(print, "callee");
    case "PipelineTopicExpression":
      return path.call(print, "expression");
    case "PipelinePrimaryTopicReference": {
      parts.push("#");
      return concat(parts);
    }

    case "ArgumentPlaceholder":
      return "?";

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return concat(["?", path.call(print, "typeAnnotation")]);
    case "TSJSDocNonNullableType":
      return concat(["!", path.call(print, "typeAnnotation")]);
    case "TSJSDocFunctionType":
      return concat([
        "function(",
        // The parameters could be here, but typescript-estree doesn't convert them anyway (throws an error).
        "): ",
        path.call(print, "typeAnnotation"),
      ]);

    default:
      /* istanbul ignore next */
      throw new Error("unknown type: " + JSON.stringify(n.type));
  }
}

function nodeStr(node, options, isFlowOrTypeScriptDirectiveLiteral) {
  const raw = rawText(node);
  const isDirectiveLiteral =
    isFlowOrTypeScriptDirectiveLiteral || node.type === "DirectiveLiteral";
  return printString(raw, options, isDirectiveLiteral);
}

function printRegex(node) {
  const flags = node.flags.split("").sort().join("");
  return `/${node.pattern}/${flags}`;
}

function canAttachComment(node) {
  return (
    node.type &&
    node.type !== "CommentBlock" &&
    node.type !== "CommentLine" &&
    node.type !== "Line" &&
    node.type !== "Block" &&
    node.type !== "EmptyStatement" &&
    node.type !== "TemplateElement" &&
    node.type !== "Import"
  );
}

module.exports = {
  preprocess,
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  hasPrettierIgnore,
  willPrintOwnComments: handleComments.willPrintOwnComments,
  canAttachComment,
  printComment,
  isBlockComment,
  handleComments: {
    // TODO: Make this as default behavior
    avoidAstMutation: true,
    ownLine: handleComments.handleOwnLineComment,
    endOfLine: handleComments.handleEndOfLineComment,
    remaining: handleComments.handleRemainingComment,
  },
  getGapRegex: handleComments.getGapRegex,
  getCommentChildNodes: handleComments.getCommentChildNodes,
};
