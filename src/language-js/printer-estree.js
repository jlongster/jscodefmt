"use strict";

/** @typedef {import("../document").Doc} Doc */

/** @type {import("assert")} */
const assert = require("assert");

// TODO(azz): anything that imports from main shouldn't be in a `language-*` dir.
const { printDanglingComments } = require("../main/comments");
const {
  hasNewline,
  printString,
  printNumber,
  isNonEmptyArray,
} = require("../common/util");
const {
  builders: { join, line, hardline, softline, literalline, group, indent },
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
  hasFlowShorthandAnnotationComment,
  hasNewlineBetweenOrAfterDecorators,
  hasComment,
  CommentCheckFlags,
  isExportDeclaration,
  isFunctionNotation,
  isGetterOrSetter,
  isTheOnlyJsxElementInMarkdown,
  isBlockComment,
  isLineComment,
  isNextLineEmpty,
  needsHardlineAfterDanglingComment,
  rawText,
  shouldPrintComma,
  hasIgnoreComment,
  isCallExpression,
  isMemberExpression,
} = require("./utils");
const { locStart, locEnd } = require("./loc");

const {
  printHtmlBinding,
  isVueEventBindingExpression,
} = require("./print/html-binding");
const { printAngular } = require("./print/angular");
const { printJsx, hasJsxIgnoreComment } = require("./print/jsx");
const { printFlow } = require("./print/flow");
const { printTypescript } = require("./print/typescript");
const {
  printOptionalToken,
  printBindExpressionCallee,
  printTypeAnnotation,
  adjustClause,
} = require("./print/misc");
const {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSpecifier,
} = require("./print/module");
const { printTernary } = require("./print/ternary");
const { printTemplateLiteral } = require("./print/template-literal");
const { printArray, printArrayItems } = require("./print/array");
const { printObject } = require("./print/object");
const {
  printClass,
  printClassMethod,
  printClassProperty,
} = require("./print/class");
const { printTypeParameters } = require("./print/type-parameters");
const { printPropertyKey, printProperty } = require("./print/property");
const {
  printFunctionDeclaration,
  printArrowFunctionExpression,
  printMethod,
  printReturnStatement,
  printThrowStatement,
} = require("./print/function");
const { printCallExpression } = require("./print/call-expression");
const { printInterface } = require("./print/interface");
const {
  printVariableDeclarator,
  printAssignmentExpression,
} = require("./print/assignment");
const { printBinaryishExpression } = require("./print/binaryish");
const { printSwitchCaseConsequent } = require("./print/statement");
const { printMemberExpression } = require("./print/member");
const { printBlock, printBlockBody } = require("./print/block");
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
    node.type === "PropertyDefinition" ||
    node.type === "TSAbstractClassProperty" ||
    node.type === "ClassPrivateProperty" ||
    node.type === "MethodDefinition" ||
    node.type === "TSAbstractMethodDefinition" ||
    node.type === "TSDeclareMethod"
  ) {
    // their decorators are handled themselves
  } else if (
    isNonEmptyArray(node.decorators) &&
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
    isNonEmptyArray(node.declaration.decorators) &&
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
      parts.push(" /*", node.trailingComments[0].value.trimStart(), "*/");
      node.trailingComments[0].printed = true;
    }

    parts.push(")");
  }

  if (decorators.length > 0) {
    return group([...decorators, ...parts]);
  }
  return parts;
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

  for (const printer of [
    printHtmlBinding,
    printAngular,
    printJsx,
    printFlow,
    printTypescript,
  ]) {
    const printed = printer(path, options, print);
    if (typeof printed !== "undefined") {
      return printed;
    }
  }

  /** @type{Doc[]} */
  let parts = [];

  switch (n.type) {
    case "JsExpressionRoot":
      return path.call(print, "node");
    case "JsonRoot":
      return [path.call(print, "node"), hardline];
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

      return parts;

    case "Program":
      return printBlockBody(path, options, print);
    // Babel extension.
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      // Detect Flow and TypeScript directives
      if (n.directive) {
        return [nodeStr(n.expression, options, true), semi];
      }

      if (options.parser === "__vue_event_binding") {
        const parent = path.getParentNode();
        if (
          parent.type === "Program" &&
          parent.body.length === 1 &&
          parent.body[0] === n
        ) {
          return [
            path.call(print, "expression"),
            isVueEventBindingExpression(n.expression) ? ";" : "",
          ];
        }
      }

      // Do not append semicolon after the only JSX element in a program
      return [
        path.call(print, "expression"),
        isTheOnlyJsxElementInMarkdown(options, path) ? "" : semi,
      ];
    // Babel non-standard node. Used for Closure-style type casts. See postprocess.js.
    case "ParenthesizedExpression": {
      const shouldHug = !hasComment(n.expression);
      if (shouldHug) {
        return ["(", path.call(print, "expression"), ")"];
      }
      return group([
        "(",
        indent([softline, path.call(print, "expression")]),
        softline,
        ")",
      ]);
    }
    case "AssignmentExpression":
      return printAssignmentExpression(path, options, print);
    case "VariableDeclarator":
      return printVariableDeclarator(path, options, print);
    case "BinaryExpression":
    case "LogicalExpression":
      return printBinaryishExpression(path, options, print);
    case "AssignmentPattern":
      return [path.call(print, "left"), " = ", path.call(print, "right")];
    case "OptionalMemberExpression":
    case "MemberExpression": {
      return printMemberExpression(path, options, print);
    }
    case "MetaProperty":
      return [path.call(print, "meta"), ".", path.call(print, "property")];
    case "BindExpression":
      if (n.object) {
        parts.push(path.call(print, "object"));
      }

      parts.push(
        group(
          indent([softline, printBindExpressionCallee(path, options, print)])
        )
      );

      return parts;
    case "Identifier": {
      return [
        n.name,
        printOptionalToken(path),
        printTypeAnnotation(path, options, print),
      ];
    }
    case "V8IntrinsicIdentifier":
      return ["%", n.name];
    case "SpreadElement":
    case "SpreadElementPattern":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return [
        "...",
        path.call(print, "argument"),
        printTypeAnnotation(path, options, print),
      ];
    case "FunctionDeclaration":
    case "FunctionExpression": {
      let expandArg = false;
      if (args && args.expandLastArg) {
        const parent = path.getParentNode();
        if (isCallExpression(parent) && getCallArguments(parent).length > 1) {
          expandArg = true;
        }
      }
      return printFunctionDeclaration(path, print, options, expandArg);
    }
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

      return parts;
    case "AwaitExpression": {
      parts.push("await");
      if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }
      const parent = path.getParentNode();
      if (
        (isCallExpression(parent) && parent.callee === n) ||
        (isMemberExpression(parent) && parent.object === n)
      ) {
        return group([indent([softline, ...parts]), softline]);
      }
      return parts;
    }
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path, options, print);
    case "ExportAllDeclaration":
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
      return [path.call(print, "key"), ": ", path.call(print, "value")];
    case "Import":
      return "import";
    case "BlockStatement":
    case "StaticBlock":
    case "ClassBody":
      return printBlock(path, options, print);
    case "ThrowStatement":
      return printThrowStatement(path, options, print);
    case "ReturnStatement":
      return printReturnStatement(path, options, print);
    case "NewExpression":
    case "ImportExpression":
    case "OptionalCallExpression":
    case "CallExpression":
      return printCallExpression(path, options, print);
    case "ObjectTypeInternalSlot":
      return [
        n.static ? "static " : "",
        "[[",
        path.call(print, "id"),
        "]]",
        printOptionalToken(path),
        n.method ? "" : ": ",
        path.call(print, "value"),
      ];

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "RecordExpression":
      return printObject(path, options, print);
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path, options, print);
      }
      return printProperty(path, options, print);
    case "ObjectMethod":
      return printMethod(path, options, print);
    case "Decorator":
      return ["@", path.call(print, "expression"), path.call(print, "callee")];
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
        path.each((expressionPath, index) => {
          if (index === 0) {
            parts.push(print(expressionPath));
          } else {
            parts.push(",", indent([line, print(expressionPath)]));
          }
        }, "expressions");
        return group(parts);
      }
      return group(join([",", line], path.map(print, "expressions")));
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
        return String(n.value);
      }
      return nodeStr(n, options);
    case "Directive":
      return [path.call(print, "value"), semi]; // Babel 6
    case "DirectiveLiteral":
      return nodeStr(n, options);
    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) {
        parts.push(" ");
      }

      if (hasComment(n.argument)) {
        parts.push(
          group([
            "(",
            indent([softline, path.call(print, "argument")]),
            softline,
            ")",
          ])
        );
      } else {
        parts.push(path.call(print, "argument"));
      }

      return parts;
    case "UpdateExpression":
      parts.push(path.call(print, "argument"), n.operator);

      if (n.prefix) {
        parts.reverse();
      }

      return parts;
    case "ConditionalExpression":
      return printTernary(path, options, print);
    case "VariableDeclaration": {
      const printed = path.map((childPath) => print(childPath), "declarations");

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      const parentNode = path.getParentNode();

      const isParentForLoop =
        parentNode.type === "ForStatement" ||
        parentNode.type === "ForInStatement" ||
        parentNode.type === "ForOfStatement";

      const hasValue = n.declarations.some((decl) => decl.init);

      let firstVariable;
      if (printed.length === 1 && !hasComment(n.declarations[0])) {
        firstVariable = printed[0];
      } else if (printed.length > 0) {
        // Indent first var to comply with eslint one-var rule
        firstVariable = indent(printed[0]);
      }

      parts = [
        n.declare ? "declare " : "",
        n.kind,
        firstVariable ? [" ", firstVariable] : "",
        indent(
          printed
            .slice(1)
            .map((p) => [
              ",",
              hasValue && !isParentForLoop ? hardline : line,
              p,
            ])
        ),
      ];

      if (!(isParentForLoop && parentNode.body !== n)) {
        parts.push(semi);
      }

      return group(parts);
    }
    case "WithStatement":
      return group([
        "with (",
        path.call(print, "object"),
        ")",
        adjustClause(n.body, path.call(print, "body")),
      ]);
    case "IfStatement": {
      const con = adjustClause(n.consequent, path.call(print, "consequent"));
      const opening = group([
        "if (",
        group([indent([softline, path.call(print, "test")]), softline]),
        ")",
        con,
      ]);

      parts.push(opening);

      if (n.alternate) {
        const commentOnOwnLine =
          hasComment(
            n.consequent,
            CommentCheckFlags.Trailing | CommentCheckFlags.Line
          ) || needsHardlineAfterDanglingComment(n);
        const elseOnSameLine =
          n.consequent.type === "BlockStatement" && !commentOnOwnLine;
        parts.push(elseOnSameLine ? " " : hardline);

        if (hasComment(n, CommentCheckFlags.Dangling)) {
          parts.push(
            printDanglingComments(path, options, true),
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

      return parts;
    }
    case "ForStatement": {
      const body = adjustClause(n.body, path.call(print, "body"));

      // We want to keep dangling comments above the loop to stay consistent.
      // Any comment positioned between the for statement and the parentheses
      // is going to be printed before the statement.
      const dangling = printDanglingComments(
        path,
        options,
        /* sameLine */ true
      );
      const printedComments = dangling ? [dangling, softline] : "";

      if (!n.init && !n.test && !n.update) {
        return [printedComments, group(["for (;;)", body])];
      }

      return [
        printedComments,
        group([
          "for (",
          group([
            indent([
              softline,
              path.call(print, "init"),
              ";",
              line,
              path.call(print, "test"),
              ";",
              line,
              path.call(print, "update"),
            ]),
            softline,
          ]),
          ")",
          body,
        ]),
      ];
    }
    case "WhileStatement":
      return group([
        "while (",
        group([indent([softline, path.call(print, "test")]), softline]),
        ")",
        adjustClause(n.body, path.call(print, "body")),
      ]);
    case "ForInStatement":
      return group([
        "for (",
        path.call(print, "left"),
        " in ",
        path.call(print, "right"),
        ")",
        adjustClause(n.body, path.call(print, "body")),
      ]);

    case "ForOfStatement":
      return group([
        "for",
        n.await ? " await" : "",
        " (",
        path.call(print, "left"),
        " of ",
        path.call(print, "right"),
        ")",
        adjustClause(n.body, path.call(print, "body")),
      ]);

    case "DoWhileStatement": {
      const clause = adjustClause(n.body, path.call(print, "body"));
      const doBody = group(["do", clause]);
      parts = [doBody];

      if (n.body.type === "BlockStatement") {
        parts.push(" ");
      } else {
        parts.push(hardline);
      }
      parts.push(
        "while (",
        group([indent([softline, path.call(print, "test")]), softline]),
        ")",
        semi
      );

      return parts;
    }
    case "DoExpression":
      return ["do ", path.call(print, "body")];
    case "BreakStatement":
      parts.push("break");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return parts;
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return parts;
    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return [path.call(print, "label"), ":;"];
      }

      return [path.call(print, "label"), ": ", path.call(print, "body")];
    case "TryStatement":
      return [
        "try ",
        path.call(print, "block"),
        n.handler ? [" ", path.call(print, "handler")] : "",
        n.finalizer ? [" finally ", path.call(print, "finalizer")] : "",
      ];
    case "CatchClause":
      if (n.param) {
        const parameterHasComments = hasComment(
          n.param,
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

        return [
          "catch ",
          parameterHasComments
            ? ["(", indent([softline, param]), softline, ") "]
            : ["(", param, ") "],
          path.call(print, "body"),
        ];
      }

      return ["catch ", path.call(print, "body")];
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return [
        group([
          "switch (",
          indent([softline, path.call(print, "discriminant")]),
          softline,
          ")",
        ]),
        " {",
        n.cases.length > 0
          ? indent([
              hardline,
              join(
                hardline,
                path.map((casePath, index, cases) => {
                  const caseNode = casePath.getValue();
                  return [
                    casePath.call(print),
                    index !== cases.length - 1 &&
                    isNextLineEmpty(caseNode, options)
                      ? hardline
                      : "",
                  ];
                }, "cases")
              ),
            ])
          : "",
        hardline,
        "}",
      ];
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
        const cons = printSwitchCaseConsequent(path, options, print);

        parts.push(
          consequent.length === 1 && consequent[0].type === "BlockStatement"
            ? [" ", cons]
            : indent([hardline, cons])
        );
      }

      return parts;
    }
    // JSX extensions below.
    case "DebuggerStatement":
      return ["debugger", semi];

    case "ClassDeclaration":
    case "ClassExpression":
      return printClass(path, options, print);
    case "ClassMethod":
    case "ClassPrivateMethod":
    case "MethodDefinition":
      return printClassMethod(path, options, print);
    case "ClassProperty":
    case "PropertyDefinition":
    case "ClassPrivateProperty":
      return printClassProperty(path, options, print);
    case "TemplateElement":
      return join(literalline, n.value.raw.split(/\r?\n/g));
    case "TemplateLiteral":
      return printTemplateLiteral(path, print, options);
    case "TaggedTemplateExpression":
      return [
        path.call(print, "tag"),
        path.call(print, "typeParameters"),
        path.call(print, "quasi"),
      ];
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
    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return [path.call(print, "elementType"), "[]"];
    case "BooleanLiteralTypeAnnotation":
      return String(n.value);

    case "EnumDeclaration":
      return ["enum ", path.call(print, "id"), " ", path.call(print, "body")];
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
          group(["{", printDanglingComments(path, options), softline, "}"])
        );
      } else {
        const members =
          n.members.length > 0
            ? [
                hardline,
                printArrayItems(path, options, "members", print),
                n.hasUnknownMembers || shouldPrintComma(options) ? "," : "",
              ]
            : [];

        parts.push(
          group([
            "{",
            indent([
              ...members,
              ...(n.hasUnknownMembers ? [hardline, "..."] : []),
            ]),
            printDanglingComments(path, options, /* sameIndent */ true),
            hardline,
            "}",
          ])
        );
      }
      return parts;
    }
    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumStringMember":
      return [
        path.call(print, "id"),
        " = ",
        typeof n.init === "object" ? path.call(print, "init") : String(n.init),
      ];
    case "EnumDefaultedMember":
      return path.call(print, "id");
    case "FunctionTypeParam": {
      const name = n.name
        ? path.call(print, "name")
        : path.getParentNode().this === n
        ? "this"
        : "";
      return [
        name,
        printOptionalToken(path),
        name ? ": " : "",
        path.call(print, "typeAnnotation"),
      ];
    }

    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
      return printInterface(path, options, print);
    case "ClassImplements":
    case "InterfaceExtends":
      return [path.call(print, "id"), path.call(print, "typeParameters")];
    case "NullableTypeAnnotation":
      return ["?", path.call(print, "typeAnnotation")];
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

      return parts;
    case "ObjectTypeIndexer": {
      return [
        n.variance ? path.call(print, "variance") : "",
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value"),
      ];
    }
    case "ObjectTypeProperty": {
      let modifier = "";

      if (n.proto) {
        modifier = "proto ";
      } else if (n.static) {
        modifier = "static ";
      }

      return [
        modifier,
        isGetterOrSetter(n) ? n.kind + " " : "",
        n.variance ? path.call(print, "variance") : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(n) ? "" : ": ",
        path.call(print, "value"),
      ];
    }
    case "QualifiedTypeIdentifier":
      return [path.call(print, "qualification"), ".", path.call(print, "id")];
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
    case "TypeCastExpression": {
      return [
        "(",
        path.call(print, "expression"),
        printTypeAnnotation(path, options, print),
        ")",
      ];
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
            return ["/*:: ", printed, " */"];
          }
        }
      }

      return printed;
    }

    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return ["%checks(", path.call(print, "value"), ")"];
    case "AnyTypeAnnotation":
    case "TSAnyKeyword":
      return "any";
    case "BooleanTypeAnnotation":
    case "TSBooleanKeyword":
      return "boolean";
    case "BigIntTypeAnnotation":
    case "TSBigIntKeyword":
      return "bigint";
    case "TSConstKeyword":
      return "const";
    case "NullLiteralTypeAnnotation":
    case "TSNullKeyword":
      return "null";
    case "NumberTypeAnnotation":
    case "TSNumberKeyword":
      return "number";
    case "SymbolTypeAnnotation":
    case "TSSymbolKeyword":
      return "symbol";
    case "StringTypeAnnotation":
    case "TSStringKeyword":
      return "string";
    case "VoidTypeAnnotation":
    case "TSVoidKeyword":
      return "void";
    case "ThisTypeAnnotation":
    case "TSThisType":
      return "this";

    case "PrivateIdentifier":
      return ["#", path.call(print, "name")];
    case "PrivateName":
      return ["#", path.call(print, "id")];

    case "InterpreterDirective":
      parts.push("#!", n.value, hardline);

      if (isNextLineEmpty(n, options)) {
        parts.push(hardline);
      }

      return parts;

    case "PipelineBareFunction":
      return path.call(print, "callee");
    case "PipelineTopicExpression":
      return path.call(print, "expression");
    case "PipelinePrimaryTopicReference": {
      parts.push("#");
      return parts;
    }

    case "ArgumentPlaceholder":
      return "?";

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
    !isBlockComment(node) &&
    !isLineComment(node) &&
    node.type !== "EmptyStatement" &&
    node.type !== "TemplateElement" &&
    node.type !== "Import" &&
    // `babel-ts` don't have similar node for `class Foo { bar() /* bat */; }`
    node.type !== "TSEmptyBodyFunctionExpression"
  );
}

module.exports = {
  preprocess,
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  hasPrettierIgnore(path) {
    return hasIgnoreComment(path) || hasJsxIgnoreComment(path);
  },
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
