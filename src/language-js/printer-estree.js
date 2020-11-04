"use strict";

/** @typedef {import("../document").Doc} Doc */

/** @type {import("assert")} */
const assert = require("assert");

// TODO(azz): anything that imports from main shouldn't be in a `language-*` dir.
const comments = require("../main/comments");
const {
  getNextNonSpaceNonCommentCharacter,
  hasNewline,
  hasNewlineInRange,
  getLast,
  getStringWidth,
  printString,
  printNumber,
  hasIgnoreComment,
  hasNodeIgnoreComment,
  getIndentSize,
  getPreferredQuote,
} = require("../common/util");
const {
  isNextLineEmpty,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../common/util-shared");
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
    fill,
    ifBreak,
    lineSuffixBoundary,
    addAlignmentToDoc,
  },
  utils: { willBreak, isLineNext, isEmpty, removeLines, normalizeParts },
  printer: { printDocToString },
} = require("../document");
const embed = require("./embed");
const clean = require("./clean");
const { insertPragma } = require("./pragma");
const handleComments = require("./comments");
const pathNeedsParens = require("./needs-parens");
const {
  printHtmlBinding,
  isVueEventBindingExpression,
} = require("./html-binding");
const preprocess = require("./preprocess");
const {
  classChildNeedsASIProtection,
  classPropMayCauseASIProblems,
  getFlowVariance,
  getFunctionParameters,
  iterateFunctionParametersPath,
  hasRestParameter,
  getLeftSidePathName,
  getParentExportDeclaration,
  getTypeScriptMappedTypeModifier,
  hasDanglingComments,
  hasFlowAnnotationComment,
  hasFlowShorthandAnnotationComment,
  hasLeadingOwnLineComment,
  hasNakedLeftSide,
  hasNewlineBetweenOrAfterDecorators,
  hasNgSideEffect,
  hasPrettierIgnore,
  hasSameLoc,
  hasTrailingComment,
  hasTrailingLineComment,
  identity,
  isBinaryish,
  isCallOrOptionalCallExpression,
  isEmptyJSXElement,
  isExportDeclaration,
  isFlowAnnotationComment,
  isFunctionNotation,
  isGetterOrSetter,
  isJestEachTemplateLiteral,
  isJSXNode,
  isJSXWhitespaceExpression,
  isLastStatement,
  isLiteral,
  isMeaningfulJSXText,
  isMemberExpressionChain,
  isMemberish,
  isNgForOf,
  isNumericLiteral,
  isObjectType,
  isObjectTypePropertyAFunction,
  isSimpleType,
  isSimpleNumber,
  isSimpleTemplateLiteral,
  isStringLiteral,
  isStringPropSafeToUnquote,
  isTemplateOnItsOwnLine,
  isTestCall,
  isTheOnlyJSXElementInMarkdown,
  isTSXFile,
  isTypeAnnotationAFunction,
  matchJsxWhitespaceRegex,
  needsHardlineAfterDanglingComment,
  rawText,
  returnArgumentHasLeadingComment,
  shouldPrintComma,
  shouldFlatten,
  startsWithNoLookaheadToken,
} = require("./utils");
const { locStart, locEnd } = require("./loc");

const printMemberChain = require("./print/member-chain");
const printCallArguments = require("./print/call-arguments");
const {
  printOptionalToken,
  printFunctionTypeParameters,
  printMemberLookup,
  printBindExpressionCallee,
} = require("./print/misc");
const { printModuleSource, printModuleSpecifiers } = require("./print/module");
const printTernaryOperator = require("./print/ternary");

const needsQuoteProps = new WeakMap();

let uid = 0;

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

function printDecorators(path, options, print) {
  const node = path.getValue();
  return group(
    concat([
      join(line, path.map(print, "decorators")),
      hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
    ])
  );
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
      return printAssignment(
        n.left,
        path.call(print, "left"),
        concat([" ", n.operator]),
        n.right,
        path.call(print, "right"),
        options
      );
    case "BinaryExpression":
    case "LogicalExpression":
    case "NGPipeExpression": {
      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      const isInsideParenthesis =
        n !== parent.body &&
        (parent.type === "IfStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "SwitchStatement" ||
          parent.type === "DoWhileStatement");

      const parts = printBinaryishExpressions(
        path,
        print,
        options,
        /* isNested */ false,
        isInsideParenthesis
      );

      //   if (
      //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
      //   ) {
      //
      // looks super weird, we want to break the children if the parent breaks
      //
      //   if (
      //     this.hasPlugin("dynamicImports") &&
      //     this.lookahead().type === tt.parenLeft
      //   ) {
      if (isInsideParenthesis) {
        return concat(parts);
      }

      // Break between the parens in
      // unaries or in a member or specific call expression, i.e.
      //
      //   (
      //     a &&
      //     b &&
      //     c
      //   ).call()
      if (
        ((parent.type === "CallExpression" ||
          parent.type === "OptionalCallExpression") &&
          parent.callee === n) ||
        parent.type === "UnaryExpression" ||
        ((parent.type === "MemberExpression" ||
          parent.type === "OptionalMemberExpression") &&
          !parent.computed)
      ) {
        return group(
          concat([indent(concat([softline, concat(parts)])), softline])
        );
      }

      // Avoid indenting sub-expressions in some cases where the first sub-expression is already
      // indented accordingly. We should indent sub-expressions where the first case isn't indented.
      const shouldNotIndent =
        parent.type === "ReturnStatement" ||
        parent.type === "ThrowStatement" ||
        (parent.type === "JSXExpressionContainer" &&
          parentParent.type === "JSXAttribute") ||
        (n.operator !== "|" && parent.type === "JsExpressionRoot") ||
        (n.type !== "NGPipeExpression" &&
          ((parent.type === "NGRoot" && options.parser === "__ng_binding") ||
            (parent.type === "NGMicrosyntaxExpression" &&
              parentParent.type === "NGMicrosyntax" &&
              parentParent.body.length === 1))) ||
        (n === parent.body && parent.type === "ArrowFunctionExpression") ||
        (n !== parent.body && parent.type === "ForStatement") ||
        (parent.type === "ConditionalExpression" &&
          parentParent.type !== "ReturnStatement" &&
          parentParent.type !== "ThrowStatement" &&
          parentParent.type !== "CallExpression" &&
          parentParent.type !== "OptionalCallExpression") ||
        parent.type === "TemplateLiteral";

      const shouldIndentIfInlining =
        parent.type === "AssignmentExpression" ||
        parent.type === "VariableDeclarator" ||
        parent.type === "ClassProperty" ||
        parent.type === "TSAbstractClassProperty" ||
        parent.type === "ClassPrivateProperty" ||
        parent.type === "ObjectProperty" ||
        parent.type === "Property";

      const samePrecedenceSubExpression =
        isBinaryish(n.left) && shouldFlatten(n.operator, n.left.operator);

      if (
        shouldNotIndent ||
        (shouldInlineLogicalExpression(n) && !samePrecedenceSubExpression) ||
        (!shouldInlineLogicalExpression(n) && shouldIndentIfInlining)
      ) {
        return group(concat(parts));
      }

      if (parts.length === 0) {
        return "";
      }

      // If the right part is a JSX node, we include it in a separate group to
      // prevent it breaking the whole chain, so we can print the expression like:
      //
      //   foo && bar && (
      //     <Foo>
      //       <Bar />
      //     </Foo>
      //   )

      const hasJSX = isJSXNode(n.right);

      const firstGroupIndex = parts.findIndex(
        (part) => typeof part !== "string" && part.type === "group"
      );

      // Separate the leftmost expression, possibly with its leading comments.
      const headParts = parts.slice(
        0,
        firstGroupIndex === -1 ? 1 : firstGroupIndex + 1
      );

      const rest = concat(
        parts.slice(headParts.length, hasJSX ? -1 : undefined)
      );

      const groupId = Symbol("logicalChain-" + ++uid);

      const chain = group(
        concat([
          // Don't include the initial expression in the indentation
          // level. The first item is guaranteed to be the first
          // left-most expression.
          ...headParts,
          indent(rest),
        ]),
        { id: groupId }
      );

      if (!hasJSX) {
        return chain;
      }

      const jsxPart = getLast(parts);
      return group(
        concat([chain, ifBreak(indent(jsxPart), jsxPart, { groupId })])
      );
    }
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
      const parent = path.getParentNode();
      let firstNonMemberParent;
      let i = 0;
      do {
        firstNonMemberParent = path.getParentNode(i);
        i++;
      } while (
        firstNonMemberParent &&
        (firstNonMemberParent.type === "MemberExpression" ||
          firstNonMemberParent.type === "OptionalMemberExpression" ||
          firstNonMemberParent.type === "TSNonNullExpression")
      );

      const shouldInline =
        (firstNonMemberParent &&
          (firstNonMemberParent.type === "NewExpression" ||
            firstNonMemberParent.type === "BindExpression" ||
            (firstNonMemberParent.type === "VariableDeclarator" &&
              firstNonMemberParent.id.type !== "Identifier") ||
            (firstNonMemberParent.type === "AssignmentExpression" &&
              firstNonMemberParent.left.type !== "Identifier"))) ||
        n.computed ||
        (n.object.type === "Identifier" &&
          n.property.type === "Identifier" &&
          parent.type !== "MemberExpression" &&
          parent.type !== "OptionalMemberExpression");

      return concat([
        path.call(print, "object"),
        shouldInline
          ? printMemberLookup(path, options, print)
          : group(
              indent(
                concat([softline, printMemberLookup(path, options, print)])
              )
            ),
      ]);
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
      parts.push(printFunctionDeclaration(path, print, options));
      if (!n.body) {
        parts.push(semi);
      }
      return concat(parts);
    case "ArrowFunctionExpression": {
      if (n.async) {
        parts.push("async ");
      }

      if (shouldPrintParamsWithoutParens(path, options)) {
        parts.push(path.call(print, "params", 0));
      } else {
        parts.push(
          group(
            concat([
              printFunctionParameters(
                path,
                print,
                options,
                /* expandLast */ args &&
                  (args.expandLastArg || args.expandFirstArg),
                /* printTypeParams */ true
              ),
              printReturnType(path, print, options),
            ])
          )
        );
      }

      const dangling = comments.printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        (comment) => {
          const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
            options.originalText,
            comment,
            locEnd
          );
          return (
            nextCharacter !== false &&
            options.originalText.slice(nextCharacter, nextCharacter + 2) ===
              "=>"
          );
        }
      );
      if (dangling) {
        parts.push(" ", dangling);
      }

      parts.push(" =>");

      const body = path.call((bodyPath) => print(bodyPath, args), "body");

      // We want to always keep these types of nodes on the same line
      // as the arrow.
      if (
        !hasLeadingOwnLineComment(options.originalText, n.body) &&
        (n.body.type === "ArrayExpression" ||
          n.body.type === "ObjectExpression" ||
          n.body.type === "BlockStatement" ||
          isJSXNode(n.body) ||
          isTemplateOnItsOwnLine(n.body, options.originalText) ||
          n.body.type === "ArrowFunctionExpression" ||
          n.body.type === "DoExpression")
      ) {
        return group(concat([concat(parts), " ", body]));
      }

      // We handle sequence expressions as the body of arrows specially,
      // so that the required parentheses end up on their own lines.
      if (n.body.type === "SequenceExpression") {
        return group(
          concat([
            concat(parts),
            group(
              concat([" (", indent(concat([softline, body])), softline, ")"])
            ),
          ])
        );
      }

      // if the arrow function is expanded as last argument, we are adding a
      // level of indentation and need to add a softline to align the closing )
      // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
      // we should align the expression's closing } with the line with the opening {.
      const shouldAddSoftLine =
        ((args && args.expandLastArg) ||
          path.getParentNode().type === "JSXExpressionContainer") &&
        !(n.comments && n.comments.length);

      const printTrailingComma =
        args && args.expandLastArg && shouldPrintComma(options, "all");

      // In order to avoid confusion between
      // a => a ? a : a
      // a <= a ? a : a
      const shouldAddParens =
        n.body.type === "ConditionalExpression" &&
        !startsWithNoLookaheadToken(n.body, /* forbidFunctionAndClass */ false);

      return group(
        concat([
          concat(parts),
          group(
            concat([
              indent(
                concat([
                  line,
                  shouldAddParens ? ifBreak("", "(") : "",
                  body,
                  shouldAddParens ? ifBreak("", ")") : "",
                ])
              ),
              shouldAddSoftLine
                ? concat([ifBreak(printTrailingComma ? "," : ""), softline])
                : "",
            ])
          ),
        ])
      );
    }
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
    case "ImportSpecifier":
      if (n.importKind) {
        parts.push(path.call(print, "importKind"), " ");
      }

      parts.push(path.call(print, "imported"));

      if (n.local && !hasSameLoc(n.local, n.imported, options)) {
        parts.push(" as ", path.call(print, "local"));
      }

      return concat(parts);
    case "ExportSpecifier": {
      parts.push(path.call(print, "local"));

      if (n.exported && !hasSameLoc(n.local, n.exported, options)) {
        parts.push(" as ", path.call(print, "exported"));
      }

      return concat(parts);
    }
    case "ImportNamespaceSpecifier":
      parts.push("* as ");
      parts.push(path.call(print, "local"));
      return concat(parts);
    case "ImportDefaultSpecifier":
      return path.call(print, "local");
    case "TSExportAssignment":
      return concat(["export = ", path.call(print, "expression"), semi]);
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path, options, print);
    case "DeclareExportDeclaration":
      return concat(["declare ", printExportDeclaration(path, options, print)]);
    case "ExportAllDeclaration":
      parts.push("export");

      if (n.exportKind === "type") {
        parts.push(" type");
      }

      parts.push(" *");

      if (n.exported) {
        parts.push(" as ", path.call(print, "exported"));
      }

      parts.push(printModuleSource(path, options, print), semi);

      return concat(parts);

    case "ExportNamespaceSpecifier":
      return concat(["* as ", path.call(print, "exported")]);
    case "ExportDefaultSpecifier":
      return path.call(print, "exported");
    case "ImportDeclaration": {
      parts.push("import");

      if (n.importKind && n.importKind !== "value") {
        parts.push(" ", n.importKind);
      }

      if (n.specifiers && n.specifiers.length > 0) {
        parts.push(printModuleSpecifiers(path, options, print));
        parts.push(printModuleSource(path, options, print));
      } else if (
        (n.importKind && n.importKind === "type") ||
        // import {} from 'x'
        /{\s*}/.test(
          options.originalText.slice(locStart(n), locStart(n.source))
        )
      ) {
        parts.push(" {}", printModuleSource(path, options, print));
      } else {
        parts.push(" ", path.call(print, "source"));
      }

      if (Array.isArray(n.assertions) && n.assertions.length !== 0) {
        parts.push(
          " assert { ",
          join(", ", path.map(print, "assertions")),
          " }"
        );
      }

      parts.push(semi);

      return concat(parts);
    }
    case "ImportAttribute":
      return concat([path.call(print, "key"), ": ", path.call(print, "value")]);
    case "Import":
      return "import";
    case "TSModuleBlock":
    case "BlockStatement":
    case "StaticBlock": {
      const naked = path.call((bodyPath) => {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

      if (n.type === "StaticBlock") {
        parts.push("static ");
      }

      const hasContent = n.body.some((node) => node.type !== "EmptyStatement");
      const hasDirectives = n.directives && n.directives.length > 0;

      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      if (
        !hasContent &&
        !hasDirectives &&
        !hasDanglingComments(n) &&
        (parent.type === "ArrowFunctionExpression" ||
          parent.type === "FunctionExpression" ||
          parent.type === "FunctionDeclaration" ||
          parent.type === "ObjectMethod" ||
          parent.type === "ClassMethod" ||
          parent.type === "ClassPrivateMethod" ||
          parent.type === "ForStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "DoWhileStatement" ||
          parent.type === "DoExpression" ||
          (parent.type === "CatchClause" && !parentParent.finalizer) ||
          parent.type === "TSModuleDeclaration" ||
          parent.type === "TSDeclareFunction" ||
          n.type === "StaticBlock")
      ) {
        return concat([...parts, "{}"]);
      }

      parts.push("{");

      // Babel 6
      if (hasDirectives) {
        path.each((childPath) => {
          parts.push(indent(concat([hardline, print(childPath), semi])));
          if (
            isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)
          ) {
            parts.push(hardline);
          }
        }, "directives");
      }

      if (hasContent) {
        parts.push(indent(concat([hardline, naked])));
      }

      parts.push(comments.printDanglingComments(path, options));
      parts.push(hardline, "}");

      return concat(parts);
    }
    case "ReturnStatement":
      return concat([
        "return",
        printReturnAndThrowArgument(path, options, print),
      ]);
    case "NewExpression":
    case "ImportExpression":
    case "OptionalCallExpression":
    case "CallExpression": {
      const isNew = n.type === "NewExpression";
      const isDynamicImport = n.type === "ImportExpression";

      const optional = printOptionalToken(path);
      const args = isDynamicImport ? [n.source] : n.arguments;
      if (
        // We want to keep CommonJS- and AMD-style require calls, and AMD-style
        // define calls, as a unit.
        // e.g. `define(["some/lib", (lib) => {`
        (!isDynamicImport &&
          !isNew &&
          n.callee.type === "Identifier" &&
          (n.callee.name === "require" || n.callee.name === "define")) ||
        // Template literals as single arguments
        (args.length === 1 &&
          isTemplateOnItsOwnLine(args[0], options.originalText)) ||
        // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        (!isNew && isTestCall(n, path.getParentNode()))
      ) {
        return concat([
          isNew ? "new " : "",
          path.call(print, "callee"),
          optional,
          printFunctionTypeParameters(path, options, print),
          concat([
            "(",
            isDynamicImport
              ? path.call(print, "source")
              : join(", ", path.map(print, "arguments")),
            ")",
          ]),
        ]);
      }

      // Inline Flow annotation comments following Identifiers in Call nodes need to
      // stay with the Identifier. For example:
      //
      // foo /*:: <SomeGeneric> */(bar);
      //
      // Here, we ensure that such comments stay between the Identifier and the Callee.
      const isIdentifierWithFlowAnnotation =
        n.callee &&
        n.callee.type === "Identifier" &&
        hasFlowAnnotationComment(n.callee.trailingComments);
      if (isIdentifierWithFlowAnnotation) {
        n.callee.trailingComments[0].printed = true;
      }

      // We detect calls on member lookups and possibly print them in a
      // special chain format. See `printMemberChain` for more info.
      if (
        !isDynamicImport &&
        !isNew &&
        isMemberish(n.callee) &&
        !path.call((path) => pathNeedsParens(path, options), "callee")
      ) {
        return printMemberChain(path, options, print);
      }

      const contents = concat([
        isNew ? "new " : "",
        isDynamicImport ? "import" : path.call(print, "callee"),
        optional,
        isIdentifierWithFlowAnnotation
          ? `/*:: ${n.callee.trailingComments[0].value.slice(2).trim()} */`
          : "",
        printFunctionTypeParameters(path, options, print),
        printCallArguments(path, options, print),
      ]);

      // We group here when the callee is itself a call expression.
      // See `isLongCurriedCallExpression` for more info.
      if (isDynamicImport || isCallOrOptionalCallExpression(n.callee)) {
        return group(contents);
      }

      return contents;
    }

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
    case "RecordExpression": {
      let propertiesField;

      if (n.type === "TSTypeLiteral") {
        propertiesField = "members";
      } else if (n.type === "TSInterfaceBody") {
        propertiesField = "body";
      } else {
        propertiesField = "properties";
      }

      const isTypeAnnotation = n.type === "ObjectTypeAnnotation";
      const fields = [];
      if (isTypeAnnotation) {
        fields.push("indexers", "callProperties", "internalSlots");
      }
      fields.push(propertiesField);

      const firstProperty = fields
        .map((field) => n[field][0])
        .sort((a, b) => locStart(a) - locStart(b))[0];

      const parent = path.getParentNode(0);
      const isFlowInterfaceLikeBody =
        isTypeAnnotation &&
        parent &&
        (parent.type === "InterfaceDeclaration" ||
          parent.type === "DeclareInterface" ||
          parent.type === "DeclareClass") &&
        path.getName() === "body";
      const shouldBreak =
        n.type === "TSInterfaceBody" ||
        isFlowInterfaceLikeBody ||
        (n.type === "ObjectPattern" &&
          parent.type !== "FunctionDeclaration" &&
          parent.type !== "FunctionExpression" &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "ObjectMethod" &&
          parent.type !== "ClassMethod" &&
          parent.type !== "ClassPrivateMethod" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "CatchClause" &&
          n.properties.some(
            (property) =>
              property.value &&
              (property.value.type === "ObjectPattern" ||
                property.value.type === "ArrayPattern")
          )) ||
        (n.type !== "ObjectPattern" &&
          firstProperty &&
          hasNewlineInRange(
            options.originalText,
            locStart(n),
            locStart(firstProperty)
          ));

      const separator = isFlowInterfaceLikeBody
        ? ";"
        : n.type === "TSInterfaceBody" || n.type === "TSTypeLiteral"
        ? ifBreak(semi, ";")
        : ",";
      const leftBrace =
        n.type === "RecordExpression" ? "#{" : n.exact ? "{|" : "{";
      const rightBrace = n.exact ? "|}" : "}";

      // Unfortunately, things are grouped together in the ast can be
      // interleaved in the source code. So we need to reorder them before
      // printing them.
      const propsAndLoc = [];
      fields.forEach((field) => {
        path.each((childPath) => {
          const node = childPath.getValue();
          propsAndLoc.push({
            node,
            printed: print(childPath),
            loc: locStart(node),
          });
        }, field);
      });

      let separatorParts = [];
      const props = propsAndLoc
        .sort((a, b) => a.loc - b.loc)
        .map((prop) => {
          const result = concat(separatorParts.concat(group(prop.printed)));
          separatorParts = [separator, line];
          if (
            (prop.node.type === "TSPropertySignature" ||
              prop.node.type === "TSMethodSignature" ||
              prop.node.type === "TSConstructSignatureDeclaration") &&
            hasNodeIgnoreComment(prop.node)
          ) {
            separatorParts.shift();
          }
          if (isNextLineEmpty(options.originalText, prop.node, locEnd)) {
            separatorParts.push(hardline);
          }
          return result;
        });

      if (n.inexact) {
        let printed;
        if (hasDanglingComments(n)) {
          const hasLineComments = !n.comments.every((comment) =>
            handleComments.isBlockComment(comment)
          );
          const printedDanglingComments = comments.printDanglingComments(
            path,
            options,
            /* sameIndent */ true
          );
          printed = concat([
            printedDanglingComments,
            hasLineComments ||
            hasNewline(
              options.originalText,
              locEnd(n.comments[n.comments.length - 1])
            )
              ? hardline
              : line,
            "...",
          ]);
        } else {
          printed = "...";
        }
        props.push(concat(separatorParts.concat(printed)));
      }

      const lastElem = getLast(n[propertiesField]);

      const canHaveTrailingSeparator = !(
        n.inexact ||
        (lastElem && lastElem.type === "RestElement") ||
        (lastElem &&
          (lastElem.type === "TSPropertySignature" ||
            lastElem.type === "TSCallSignatureDeclaration" ||
            lastElem.type === "TSMethodSignature" ||
            lastElem.type === "TSConstructSignatureDeclaration") &&
          hasNodeIgnoreComment(lastElem))
      );

      let content;
      if (props.length === 0) {
        if (!hasDanglingComments(n)) {
          return concat([
            leftBrace,
            rightBrace,
            printTypeAnnotation(path, options, print),
          ]);
        }

        content = group(
          concat([
            leftBrace,
            comments.printDanglingComments(path, options),
            softline,
            rightBrace,
            printOptionalToken(path),
            printTypeAnnotation(path, options, print),
          ])
        );
      } else {
        content = concat([
          leftBrace,
          indent(
            concat([options.bracketSpacing ? line : softline, concat(props)])
          ),
          ifBreak(
            canHaveTrailingSeparator &&
              (separator !== "," || shouldPrintComma(options))
              ? separator
              : ""
          ),
          concat([options.bracketSpacing ? line : softline, rightBrace]),
          printOptionalToken(path),
          printTypeAnnotation(path, options, print),
        ]);
      }

      // If we inline the object as first argument of the parent, we don't want
      // to create another group so that the object breaks before the return
      // type
      if (
        path.match(
          (node) => node.type === "ObjectPattern" && !node.decorators,
          (node, name, number) =>
            shouldHugArguments(node) &&
            (name === "params" ||
              name === "parameters" ||
              name === "this" ||
              name === "rest") &&
            number === 0
        ) ||
        path.match(
          shouldHugType,
          (node, name) => name === "typeAnnotation",
          (node, name) => name === "typeAnnotation",
          (node, name, number) =>
            shouldHugArguments(node) &&
            (name === "params" ||
              name === "parameters" ||
              name === "this" ||
              name === "rest") &&
            number === 0
        )
      ) {
        return content;
      }

      return group(content, { shouldBreak });
    }
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
      if (n.decorators && n.decorators.length !== 0) {
        parts.push(printDecorators(path, options, print));
      }
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.type === "TSAbstractMethodDefinition" || n.abstract) {
        parts.push("abstract ");
      }

      parts.push(printMethod(path, options, print));

      return concat(parts);
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
    case "TupleExpression": {
      const openBracket = n.type === "TupleExpression" ? "#[" : "[";
      const closeBracket = "]";
      if (n.elements.length === 0) {
        if (!hasDanglingComments(n)) {
          parts.push(openBracket, closeBracket);
        } else {
          parts.push(
            group(
              concat([
                openBracket,
                comments.printDanglingComments(path, options),
                softline,
                closeBracket,
              ])
            )
          );
        }
      } else {
        const lastElem = getLast(n.elements);
        const canHaveTrailingComma = !(
          lastElem && lastElem.type === "RestElement"
        );

        // JavaScript allows you to have empty elements in an array which
        // changes its length based on the number of commas. The algorithm
        // is that if the last argument is null, we need to force insert
        // a comma to ensure JavaScript recognizes it.
        //   [,].length === 1
        //   [1,].length === 1
        //   [1,,].length === 2
        //
        // Note that getLast returns null if the array is empty, but
        // we already check for an empty array just above so we are safe
        const needsForcedTrailingComma =
          canHaveTrailingComma && lastElem === null;

        const shouldBreak =
          !options.__inJestEach &&
          n.elements.length > 1 &&
          n.elements.every((element, i, elements) => {
            const elementType = element && element.type;
            if (
              elementType !== "ArrayExpression" &&
              elementType !== "ObjectExpression"
            ) {
              return false;
            }

            const nextElement = elements[i + 1];
            if (nextElement && elementType !== nextElement.type) {
              return false;
            }

            const itemsKey =
              elementType === "ArrayExpression" ? "elements" : "properties";

            return element[itemsKey] && element[itemsKey].length > 1;
          });

        parts.push(
          group(
            concat([
              openBracket,
              indent(
                concat([
                  softline,
                  printArrayItems(path, options, "elements", print),
                ])
              ),
              needsForcedTrailingComma ? "," : "",
              ifBreak(
                canHaveTrailingComma &&
                  !needsForcedTrailingComma &&
                  shouldPrintComma(options)
                  ? ","
                  : ""
              ),
              comments.printDanglingComments(
                path,
                options,
                /* sameIndent */ true
              ),
              softline,
              closeBracket,
            ]),
            { shouldBreak }
          )
        );
      }

      parts.push(
        printOptionalToken(path),
        printTypeAnnotation(path, options, print)
      );

      return concat(parts);
    }
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
    case "VariableDeclarator":
      return printAssignment(
        n.id,
        path.call(print, "id"),
        " =",
        n.init,
        n.init && path.call(print, "init"),
        options
      );
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
              (comment) =>
                comment.trailing && !handleComments.isBlockComment(comment)
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
              !handleComments.isBlockComment(comment) ||
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
    case "ThrowStatement":
      return concat([
        "throw",
        printReturnAndThrowArgument(path, options, print),
      ]);
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
    case "JSXAttribute":
      parts.push(path.call(print, "name"));

      if (n.value) {
        let res;
        if (isStringLiteral(n.value)) {
          const raw = rawText(n.value);
          // Unescape all quotes so we get an accurate preferred quote
          let final = raw.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
          const quote = getPreferredQuote(
            final,
            options.jsxSingleQuote ? "'" : '"'
          );
          const escape = quote === "'" ? "&apos;" : "&quot;";
          final = final.slice(1, -1).replace(new RegExp(quote, "g"), escape);
          res = concat([quote, final, quote]);
        } else {
          res = path.call(print, "value");
        }
        parts.push("=", res);
      }

      return concat(parts);
    case "JSXIdentifier":
      return "" + n.name;
    case "JSXNamespacedName":
      return join(":", [
        path.call(print, "namespace"),
        path.call(print, "name"),
      ]);
    case "JSXMemberExpression":
      return join(".", [
        path.call(print, "object"),
        path.call(print, "property"),
      ]);
    case "TSQualifiedName":
      return join(".", [path.call(print, "left"), path.call(print, "right")]);
    case "JSXSpreadAttribute":
    case "JSXSpreadChild": {
      return concat([
        "{",
        path.call(
          (p) => {
            const printed = concat(["...", print(p)]);
            const n = p.getValue();
            if (!n.comments || !n.comments.length || !willPrintOwnComments(p)) {
              return printed;
            }
            return concat([
              indent(
                concat([
                  softline,
                  comments.printComments(p, () => printed, options),
                ])
              ),
              softline,
            ]);
          },
          n.type === "JSXSpreadAttribute" ? "argument" : "expression"
        ),
        "}",
      ]);
    }
    case "JSXExpressionContainer": {
      const parent = path.getParentNode(0);

      const hasComments =
        n.expression.comments && n.expression.comments.length > 0;

      const shouldInline =
        n.expression.type === "JSXEmptyExpression" ||
        (!hasComments &&
          (n.expression.type === "ArrayExpression" ||
            n.expression.type === "ObjectExpression" ||
            n.expression.type === "ArrowFunctionExpression" ||
            n.expression.type === "CallExpression" ||
            n.expression.type === "OptionalCallExpression" ||
            n.expression.type === "FunctionExpression" ||
            n.expression.type === "TemplateLiteral" ||
            n.expression.type === "TaggedTemplateExpression" ||
            n.expression.type === "DoExpression" ||
            (isJSXNode(parent) &&
              (n.expression.type === "ConditionalExpression" ||
                isBinaryish(n.expression)))));

      if (shouldInline) {
        return group(
          concat(["{", path.call(print, "expression"), lineSuffixBoundary, "}"])
        );
      }

      return group(
        concat([
          "{",
          indent(concat([softline, path.call(print, "expression")])),
          softline,
          lineSuffixBoundary,
          "}",
        ])
      );
    }
    case "JSXFragment":
    case "JSXElement": {
      const elem = comments.printComments(
        path,
        () => printJSXElement(path, options, print),
        options
      );
      return maybeWrapJSXElementInParens(path, elem, options);
    }
    case "JSXOpeningElement": {
      const n = path.getValue();

      const nameHasComments =
        (n.name && n.name.comments && n.name.comments.length > 0) ||
        (n.typeParameters &&
          n.typeParameters.comments &&
          n.typeParameters.comments.length > 0);

      // Don't break self-closing elements with no attributes and no comments
      if (n.selfClosing && !n.attributes.length && !nameHasComments) {
        return concat([
          "<",
          path.call(print, "name"),
          path.call(print, "typeParameters"),
          " />",
        ]);
      }

      // don't break up opening elements with a single long text attribute
      if (
        n.attributes &&
        n.attributes.length === 1 &&
        n.attributes[0].value &&
        isStringLiteral(n.attributes[0].value) &&
        !n.attributes[0].value.value.includes("\n") &&
        // We should break for the following cases:
        // <div
        //   // comment
        //   attr="value"
        // >
        // <div
        //   attr="value"
        //   // comment
        // >
        !nameHasComments &&
        (!n.attributes[0].comments || !n.attributes[0].comments.length)
      ) {
        return group(
          concat([
            "<",
            path.call(print, "name"),
            path.call(print, "typeParameters"),
            " ",
            concat(path.map(print, "attributes")),
            n.selfClosing ? " />" : ">",
          ])
        );
      }

      const lastAttrHasTrailingComments =
        n.attributes.length && hasTrailingComment(getLast(n.attributes));

      const bracketSameLine =
        // Simple tags (no attributes and no comment in tag name) should be
        // kept unbroken regardless of `jsxBracketSameLine`
        (!n.attributes.length && !nameHasComments) ||
        (options.jsxBracketSameLine &&
          // We should print the bracket in a new line for the following cases:
          // <div
          //   // comment
          // >
          // <div
          //   attr // comment
          // >
          (!nameHasComments || n.attributes.length) &&
          !lastAttrHasTrailingComments);

      // We should print the opening element expanded if any prop value is a
      // string literal with newlines
      const shouldBreak =
        n.attributes &&
        n.attributes.some(
          (attr) =>
            attr.value &&
            isStringLiteral(attr.value) &&
            attr.value.value.includes("\n")
        );

      return group(
        concat([
          "<",
          path.call(print, "name"),
          path.call(print, "typeParameters"),
          concat([
            indent(
              concat(
                path.map((attr) => concat([line, print(attr)]), "attributes")
              )
            ),
            n.selfClosing ? line : bracketSameLine ? ">" : softline,
          ]),
          n.selfClosing ? "/>" : bracketSameLine ? "" : ">",
        ]),
        { shouldBreak }
      );
    }
    case "JSXClosingElement":
      return concat(["</", path.call(print, "name"), ">"]);
    case "JSXOpeningFragment":
    case "JSXClosingFragment": {
      const hasComment = n.comments && n.comments.length;
      const hasOwnLineComment =
        hasComment &&
        !n.comments.every((comment) => handleComments.isBlockComment(comment));
      const isOpeningFragment = n.type === "JSXOpeningFragment";
      return concat([
        isOpeningFragment ? "<" : "</",
        indent(
          concat([
            hasOwnLineComment
              ? hardline
              : hasComment && !isOpeningFragment
              ? " "
              : "",
            comments.printDanglingComments(path, options, true),
          ])
        ),
        hasOwnLineComment ? hardline : "",
        ">",
      ]);
    }
    case "JSXText":
      /* istanbul ignore next */
      throw new Error("JSXTest should be handled by JSXElement");
    case "JSXEmptyExpression": {
      const requiresHardline =
        n.comments &&
        !n.comments.every((comment) => handleComments.isBlockComment(comment));

      return concat([
        comments.printDanglingComments(
          path,
          options,
          /* sameIndent */ !requiresHardline
        ),
        requiresHardline ? hardline : "",
      ]);
    }
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
      const variance = getFlowVariance(n);
      if (variance) {
        parts.push(variance);
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
      parts.push(concat(printClass(path, options, print)));
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
    case "TemplateLiteral": {
      const parentNode = path.getParentNode();

      if (isJestEachTemplateLiteral(n, parentNode)) {
        const printed = printJestEachTemplateLiteral(path, options, print);
        if (printed) {
          return printed;
        }
      }

      let expressions = path.map(print, "expressions");
      const isSimple = isSimpleTemplateLiteral(n);

      if (isSimple) {
        expressions = expressions.map(
          (doc) =>
            printDocToString(doc, { ...options, printWidth: Infinity })
              .formatted
        );
      }

      parts.push(lineSuffixBoundary, "`");

      path.each((childPath) => {
        const i = childPath.getName();

        parts.push(print(childPath));

        if (i < expressions.length) {
          // For a template literal of the following form:
          //   `someQuery {
          //     ${call({
          //       a,
          //       b,
          //     })}
          //   }`
          // the expression is on its own line (there is a \n in the previous
          // quasi literal), therefore we want to indent the JavaScript
          // expression inside at the beginning of ${ instead of the beginning
          // of the `.
          const { tabWidth } = options;
          const quasi = childPath.getValue();
          const indentSize = getIndentSize(quasi.value.raw, tabWidth);

          let printed = expressions[i];

          if (!isSimple) {
            // Breaks at the template element boundaries (${ and }) are preferred to breaking
            // in the middle of a MemberExpression
            if (
              (n.expressions[i].comments && n.expressions[i].comments.length) ||
              n.expressions[i].type === "MemberExpression" ||
              n.expressions[i].type === "OptionalMemberExpression" ||
              n.expressions[i].type === "ConditionalExpression" ||
              n.expressions[i].type === "SequenceExpression" ||
              n.expressions[i].type === "TSAsExpression" ||
              isBinaryish(n.expressions[i])
            ) {
              printed = concat([indent(concat([softline, printed])), softline]);
            }
          }

          const aligned =
            indentSize === 0 && quasi.value.raw.endsWith("\n")
              ? align(-Infinity, printed)
              : addAlignmentToDoc(printed, indentSize, tabWidth);

          parts.push(group(concat(["${", aligned, lineSuffixBoundary, "}"])));
        }
      }, "quasis");

      parts.push("`");

      return concat(parts);
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
      const hasRest =
        n[typesField].length > 0 &&
        getLast(n[typesField]).type === "TSRestType";
      return group(
        concat([
          "[",
          indent(
            concat([
              softline,
              printArrayItems(path, options, typesField, print),
            ])
          ),
          ifBreak(shouldPrintComma(options, "all") && !hasRest ? "," : ""),
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
      return printFlowDeclaration(path, [
        "function ",
        path.call(print, "id"),
        n.predicate ? " " : "",
        path.call(print, "predicate"),
        semi,
      ]);
    case "DeclareModule":
      return printFlowDeclaration(path, [
        "module ",
        path.call(print, "id"),
        " ",
        path.call(print, "body"),
      ]);
    case "DeclareModuleExports":
      return printFlowDeclaration(path, [
        "module.exports",
        ": ",
        path.call(print, "typeAnnotation"),
        semi,
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", path.call(print, "id"), semi]);
    case "DeclareExportAllDeclaration":
      return concat([
        "declare export *",
        printModuleSource(path, options, print),
      ]);
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
        return printFlowDeclaration(path, parts);
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
            !getFlowVariance(parent) &&
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

      if (isObjectTypePropertyAFunction(parent, options)) {
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
    case "TSInterfaceDeclaration": {
      if (n.type === "DeclareInterface" || n.declare) {
        parts.push("declare ");
      }

      if (n.type === "TSInterfaceDeclaration") {
        parts.push(
          n.abstract ? "abstract " : "",
          printTypeScriptModifiers(path, options, print)
        );
      }

      parts.push("interface");

      const partsGroup = [];
      const extendsParts = [];

      if (n.type !== "InterfaceTypeAnnotation") {
        partsGroup.push(
          " ",
          path.call(print, "id"),
          path.call(print, "typeParameters")
        );
      }

      const shouldIndentOnlyHeritageClauses =
        n.typeParameters && !hasTrailingLineComment(n.typeParameters);

      if (n.extends && n.extends.length !== 0) {
        extendsParts.push(
          shouldIndentOnlyHeritageClauses
            ? ifBreak(" ", line, {
                groupId: getTypeParametersGroupId(n.typeParameters),
              })
            : line,
          "extends ",
          (n.extends.length === 1 ? identity : indent)(
            join(concat([",", line]), path.map(print, "extends"))
          )
        );
      }

      if (
        (n.id && hasTrailingComment(n.id)) ||
        (n.extends && n.extends.length !== 0)
      ) {
        const printedExtends = concat(extendsParts);
        if (shouldIndentOnlyHeritageClauses) {
          parts.push(
            group(
              concat(
                partsGroup.concat(
                  ifBreak(indent(printedExtends), printedExtends)
                )
              )
            )
          );
        } else {
          parts.push(group(indent(concat(partsGroup.concat(printedExtends)))));
        }
      } else {
        parts.push(...partsGroup, ...extendsParts);
      }

      parts.push(" ", path.call(print, "body"));

      return group(concat(parts));
    }
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
    case "ObjectTypeCallProperty":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(path.call(print, "value"));

      return concat(parts);
    case "ObjectTypeIndexer": {
      const variance = getFlowVariance(n);
      return concat([
        variance || "",
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value"),
      ]);
    }
    case "ObjectTypeProperty": {
      const variance = getFlowVariance(n);

      let modifier = "";

      if (n.proto) {
        modifier = "proto ";
      } else if (n.static) {
        modifier = "static ";
      }

      return concat([
        modifier,
        isGetterOrSetter(n) ? n.kind + " " : "",
        variance || "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(n, options) ? "" : ": ",
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
          return concat([
            "/*:: ",
            printTypeParameters(path, options, print, "params"),
            " */",
          ]);
        }
      }

      return printTypeParameters(path, options, print, "params");
    }

    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter": {
      const parent = path.getParentNode();
      if (parent.type === "TSMappedType") {
        parts.push("[", path.call(print, "name"));
        if (n.constraint) {
          parts.push(" in ", path.call(print, "constraint"));
        }
        if (parent.nameType) {
          parts.push(
            " as ",
            path.callParent((path) => {
              return path.call(print, "nameType");
            })
          );
        }
        parts.push("]");
        return concat(parts);
      }

      const variance = getFlowVariance(n);

      if (variance) {
        parts.push(variance);
      }

      parts.push(path.call(print, "name"));

      if (n.bound) {
        parts.push(": ");
        parts.push(path.call(print, "bound"));
      }

      if (n.constraint) {
        parts.push(" extends ", path.call(print, "constraint"));
      }

      if (n.default) {
        parts.push(" = ", path.call(print, "default"));
      }

      // Keep comma if the file extension is .tsx and
      // has one type parameter that isn't extend with any types.
      // Because, otherwise formatted result will be invalid as tsx.
      const grandParent = path.getNode(2);
      if (
        getFunctionParameters(parent).length === 1 &&
        isTSXFile(options) &&
        !n.constraint &&
        grandParent.type === "ArrowFunctionExpression"
      ) {
        parts.push(",");
      }

      return concat(parts);
    }
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
      return concat(["#", path.call(print, "id")]);

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

    case "NGRoot":
      return concat(
        [].concat(
          path.call(print, "node"),
          !n.node.comments || n.node.comments.length === 0
            ? []
            : concat([" //", n.node.comments[0].value.trimEnd()])
        )
      );
    case "NGChainedExpression":
      return group(
        join(
          concat([";", line]),
          path.map(
            (childPath) =>
              hasNgSideEffect(childPath)
                ? print(childPath)
                : concat(["(", print(childPath), ")"]),
            "expressions"
          )
        )
      );
    case "NGEmptyExpression":
      return "";
    case "NGQuotedExpression":
      return concat([n.prefix, ": ", n.value.trim()]);
    case "NGMicrosyntax":
      return concat(
        path.map(
          (childPath, index) =>
            concat([
              index === 0
                ? ""
                : isNgForOf(childPath.getValue(), index, n)
                ? " "
                : concat([";", line]),
              print(childPath),
            ]),
          "body"
        )
      );
    case "NGMicrosyntaxKey":
      return /^[$_a-z][\w$]*(-[$_a-z][\w$])*$/i.test(n.name)
        ? n.name
        : JSON.stringify(n.name);
    case "NGMicrosyntaxExpression":
      return concat([
        path.call(print, "expression"),
        n.alias === null ? "" : concat([" as ", path.call(print, "alias")]),
      ]);
    case "NGMicrosyntaxKeyedExpression": {
      const index = path.getName();
      const parentNode = path.getParentNode();
      const shouldNotPrintColon =
        isNgForOf(n, index, parentNode) ||
        (((index === 1 && (n.key.name === "then" || n.key.name === "else")) ||
          (index === 2 &&
            n.key.name === "else" &&
            parentNode.body[index - 1].type ===
              "NGMicrosyntaxKeyedExpression" &&
            parentNode.body[index - 1].key.name === "then")) &&
          parentNode.body[0].type === "NGMicrosyntaxExpression");
      return concat([
        path.call(print, "key"),
        shouldNotPrintColon ? " " : ": ",
        path.call(print, "expression"),
      ]);
    }
    case "NGMicrosyntaxLet":
      return concat([
        "let ",
        path.call(print, "key"),
        n.value === null ? "" : concat([" = ", path.call(print, "value")]),
      ]);
    case "NGMicrosyntaxAs":
      return concat([
        path.call(print, "key"),
        " as ",
        path.call(print, "alias"),
      ]);

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

function printStatementSequence(path, options, print) {
  const printed = [];

  const bodyNode = path.getNode();
  const isClass = bodyNode.type === "ClassBody";

  path.each((stmtPath, i) => {
    const stmt = stmtPath.getValue();

    // Just in case the AST has been modified to contain falsy
    // "statements," it's safer simply to skip them.
    /* istanbul ignore if */
    if (!stmt) {
      return;
    }

    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (stmt.type === "EmptyStatement") {
      return;
    }

    const stmtPrinted = print(stmtPath);
    const text = options.originalText;
    const parts = [];

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon
    if (
      !options.semi &&
      !isClass &&
      !isTheOnlyJSXElementInMarkdown(options, stmtPath) &&
      stmtNeedsASIProtection(stmtPath, options)
    ) {
      if (stmt.comments && stmt.comments.some((comment) => comment.leading)) {
        parts.push(print(stmtPath, { needsSemi: true }));
      } else {
        parts.push(";", stmtPrinted);
      }
    } else {
      parts.push(stmtPrinted);
    }

    if (!options.semi && isClass) {
      if (classPropMayCauseASIProblems(stmtPath)) {
        parts.push(";");
      } else if (stmt.type === "ClassProperty") {
        const nextChild = bodyNode.body[i + 1];
        if (classChildNeedsASIProtection(nextChild)) {
          parts.push(";");
        }
      }
    }

    if (isNextLineEmpty(text, stmt, locEnd) && !isLastStatement(stmtPath)) {
      parts.push(hardline);
    }

    printed.push(concat(parts));
  });

  return join(hardline, printed);
}

function printPropertyKey(path, options, print) {
  const node = path.getNode();

  if (node.computed) {
    return concat(["[", path.call(print, "key"), "]"]);
  }

  const parent = path.getParentNode();
  const { key } = node;

  if (
    node.type === "ClassPrivateProperty" &&
    // flow has `Identifier` key, and babel has `PrivateName` key
    key.type === "Identifier"
  ) {
    return concat(["#", path.call(print, "key")]);
  }

  if (options.quoteProps === "consistent" && !needsQuoteProps.has(parent)) {
    const objectHasStringProp = (
      parent.properties ||
      parent.body ||
      parent.members
    ).some(
      (prop) =>
        !prop.computed &&
        prop.key &&
        isStringLiteral(prop.key) &&
        !isStringPropSafeToUnquote(prop, options)
    );
    needsQuoteProps.set(parent, objectHasStringProp);
  }

  if (
    (key.type === "Identifier" ||
      (isNumericLiteral(key) &&
        isSimpleNumber(printNumber(rawText(key))) &&
        // Avoid converting 999999999999999999999 to 1e+21, 0.99999999999999999 to 1 and 1.0 to 1.
        String(key.value) === printNumber(rawText(key)) &&
        // Quoting number keys is safe in JS and Flow, but not in TypeScript (as
        // mentioned in `isStringPropSafeToUnquote`).
        !(options.parser === "typescript" || options.parser === "babel-ts"))) &&
    (options.parser === "json" ||
      (options.quoteProps === "consistent" && needsQuoteProps.get(parent)))
  ) {
    // a -> "a"
    // 1 -> "1"
    // 1.5 -> "1.5"
    const prop = printString(
      JSON.stringify(
        key.type === "Identifier" ? key.name : key.value.toString()
      ),
      options
    );
    return path.call(
      (keyPath) => comments.printComments(keyPath, () => prop, options),
      "key"
    );
  }

  if (
    isStringPropSafeToUnquote(node, options) &&
    (options.quoteProps === "as-needed" ||
      (options.quoteProps === "consistent" && !needsQuoteProps.get(parent)))
  ) {
    // 'a' -> a
    // '1' -> 1
    // '1.5' -> 1.5
    return path.call(
      (keyPath) =>
        comments.printComments(
          keyPath,
          () => (/^\d/.test(key.value) ? printNumber(key.value) : key.value),
          options
        ),
      "key"
    );
  }

  return path.call(print, "key");
}

function printMethod(path, options, print) {
  const node = path.getNode();
  const { kind } = node;
  const value = node.value || node;
  const parts = [];

  if (!kind || kind === "init" || kind === "method" || kind === "constructor") {
    if (value.async) {
      parts.push("async ");
    }
  } else {
    assert.ok(kind === "get" || kind === "set");

    parts.push(kind, " ");
  }

  // A `getter`/`setter` can't be a generator, but it's recoverable
  if (value.generator) {
    parts.push("*");
  }

  parts.push(
    printPropertyKey(path, options, print),
    node.optional || node.key.optional ? "?" : "",
    node === value
      ? printMethodInternal(path, options, print)
      : path.call((path) => printMethodInternal(path, options, print), "value")
  );

  return concat(parts);
}

function printMethodInternal(path, options, print) {
  const parts = [
    printFunctionTypeParameters(path, options, print),
    group(
      concat([
        printFunctionParameters(path, print, options),
        printReturnType(path, print, options),
      ])
    ),
  ];

  if (path.getNode().body) {
    parts.push(" ", path.call(print, "body"));
  } else {
    parts.push(options.semi ? ";" : "");
  }

  return concat(parts);
}

function printJestEachTemplateLiteral(path, options, print) {
  /**
   * a    | b    | expected
   * ${1} | ${1} | ${2}
   * ${1} | ${2} | ${3}
   * ${2} | ${1} | ${3}
   */
  const node = path.getNode();
  const headerNames = node.quasis[0].value.raw.trim().split(/\s*\|\s*/);
  if (
    headerNames.length > 1 ||
    headerNames.some((headerName) => headerName.length !== 0)
  ) {
    options.__inJestEach = true;
    const expressions = path.map(print, "expressions");
    options.__inJestEach = false;
    const parts = [];
    const stringifiedExpressions = expressions.map(
      (doc) =>
        "${" +
        printDocToString(doc, {
          ...options,
          printWidth: Infinity,
          endOfLine: "lf",
        }).formatted +
        "}"
    );

    const tableBody = [{ hasLineBreak: false, cells: [] }];
    for (let i = 1; i < node.quasis.length; i++) {
      const row = tableBody[tableBody.length - 1];
      const correspondingExpression = stringifiedExpressions[i - 1];

      row.cells.push(correspondingExpression);
      if (correspondingExpression.includes("\n")) {
        row.hasLineBreak = true;
      }

      if (node.quasis[i].value.raw.includes("\n")) {
        tableBody.push({ hasLineBreak: false, cells: [] });
      }
    }

    const maxColumnCount = Math.max(
      headerNames.length,
      ...tableBody.map((row) => row.cells.length)
    );

    const maxColumnWidths = Array.from({ length: maxColumnCount }).fill(0);
    const table = [
      { cells: headerNames },
      ...tableBody.filter((row) => row.cells.length !== 0),
    ];
    for (const { cells } of table.filter((row) => !row.hasLineBreak)) {
      cells.forEach((cell, index) => {
        maxColumnWidths[index] = Math.max(
          maxColumnWidths[index],
          getStringWidth(cell)
        );
      });
    }

    parts.push(
      lineSuffixBoundary,
      "`",
      indent(
        concat([
          hardline,
          join(
            hardline,
            table.map((row) =>
              join(
                " | ",
                row.cells.map((cell, index) =>
                  row.hasLineBreak
                    ? cell
                    : cell +
                      " ".repeat(maxColumnWidths[index] - getStringWidth(cell))
                )
              )
            )
          ),
        ])
      ),
      hardline,
      "`"
    );
    return concat(parts);
  }
}

function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();
  const isDefinite =
    node.definite ||
    (parentNode &&
      parentNode.type === "VariableDeclarator" &&
      parentNode.definite);

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation)) {
    return concat([" /*: ", path.call(print, "typeAnnotation"), " */"]);
  }

  return concat([
    isFunctionDeclarationIdentifier ? "" : isDefinite ? "!: " : ": ",
    path.call(print, "typeAnnotation"),
  ]);
}

function printFunctionParameters(
  path,
  print,
  options,
  expandArg,
  printTypeParams
) {
  const functionNode = path.getValue();
  const parameters = getFunctionParameters(functionNode);
  const typeParams = printTypeParams
    ? printFunctionTypeParameters(path, options, print)
    : "";

  if (parameters.length === 0) {
    return concat([
      typeParams,
      "(",
      comments.printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        (comment) =>
          getNextNonSpaceNonCommentCharacter(
            options.originalText,
            comment,
            locEnd
          ) === ")"
      ),
      ")",
    ]);
  }

  const parent = path.getParentNode();
  const isParametersInTestCall = isTestCall(parent);
  const shouldHugParameters = shouldHugArguments(functionNode);
  const shouldExpandParameters =
    expandArg && !parameters.some((node) => node.comments);
  const printed = [];
  iterateFunctionParametersPath(path, (parameterPath, index) => {
    const isLastParameter = index === parameters.length - 1;
    if (isLastParameter && functionNode.rest) {
      printed.push("...");
    }
    printed.push(parameterPath.call(print));
    if (isLastParameter) {
      return;
    }
    printed.push(",");
    if (
      isParametersInTestCall ||
      shouldHugParameters ||
      shouldExpandParameters
    ) {
      printed.push(" ");
    } else if (
      isNextLineEmpty(options.originalText, parameters[index], locEnd)
    ) {
      printed.push(hardline, hardline);
    } else {
      printed.push(line);
    }
  });

  // If the parent is a call with the first/last argument expansion and this is the
  // params of the first/last argument, we don't want the arguments to break and instead
  // want the whole expression to be on a new line.
  //
  // Good:                 Bad:
  //   verylongcall(         verylongcall((
  //     (a, b) => {           a,
  //     }                     b,
  //   })                    ) => {
  //                         })
  if (shouldExpandParameters) {
    return group(
      concat([
        removeLines(typeParams),
        "(",
        concat(printed.map((doc) => removeLines(doc))),
        ")",
      ])
    );
  }

  // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}
  const hasNotParameterDecorator = parameters.every((node) => !node.decorators);
  if (shouldHugParameters && hasNotParameterDecorator) {
    return concat([typeParams, "(", concat(printed), ")"]);
  }

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isParametersInTestCall) {
    return concat([typeParams, "(", concat(printed), ")"]);
  }

  const isFlowShorthandWithOneArg =
    (isObjectTypePropertyAFunction(parent, options) ||
      isTypeAnnotationAFunction(parent, options) ||
      parent.type === "TypeAlias" ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType" ||
      parent.type === "IntersectionTypeAnnotation" ||
      (parent.type === "FunctionTypeAnnotation" &&
        parent.returnType === functionNode)) &&
    parameters.length === 1 &&
    parameters[0].name === null &&
    // `type q = (this: string) => void;`
    functionNode.this !== parameters[0] &&
    parameters[0].typeAnnotation &&
    functionNode.typeParameters === null &&
    isSimpleType(parameters[0].typeAnnotation) &&
    !functionNode.rest;

  if (isFlowShorthandWithOneArg) {
    if (options.arrowParens === "always") {
      return concat(["(", concat(printed), ")"]);
    }
    return concat(printed);
  }

  return concat([
    typeParams,
    "(",
    indent(concat([softline, concat(printed)])),
    ifBreak(
      !hasRestParameter(functionNode) && shouldPrintComma(options, "all")
        ? ","
        : ""
    ),
    softline,
    ")",
  ]);
}

function shouldPrintParamsWithoutParens(path, options) {
  if (options.arrowParens === "always") {
    return false;
  }

  if (options.arrowParens === "avoid") {
    const node = path.getValue();
    return canPrintParamsWithoutParens(node);
  }

  // Fallback default; should be unreachable
  /* istanbul ignore next */
  return false;
}

function canPrintParamsWithoutParens(node) {
  const parameters = getFunctionParameters(node);
  return (
    parameters.length === 1 &&
    !node.typeParameters &&
    !hasDanglingComments(node) &&
    parameters[0].type === "Identifier" &&
    !parameters[0].typeAnnotation &&
    !parameters[0].comments &&
    !parameters[0].optional &&
    !node.predicate &&
    !node.returnType
  );
}

function printFunctionDeclaration(path, print, options) {
  const n = path.getValue();
  const parts = [];

  if (n.async) {
    parts.push("async ");
  }

  if (n.generator) {
    parts.push("function* ");
  } else {
    parts.push("function ");
  }

  if (n.id) {
    parts.push(path.call(print, "id"));
  }

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group(
      concat([
        printFunctionParameters(path, print, options),
        printReturnType(path, print, options),
      ])
    ),
    n.body ? " " : "",
    path.call(print, "body")
  );

  return concat(parts);
}

function printReturnType(path, print, options) {
  const n = path.getValue();
  const returnType = path.call(print, "returnType");

  if (
    n.returnType &&
    isFlowAnnotationComment(options.originalText, n.returnType)
  ) {
    return concat([" /*: ", returnType, " */"]);
  }

  const parts = [returnType];

  // prepend colon to TypeScript type annotation
  if (n.returnType && n.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path.call(print, "predicate"));
  }

  return concat(parts);
}

function printExportDeclaration(path, options, print) {
  const decl = path.getValue();

  const semi = options.semi ? ";" : "";

  /** @type{Doc[]} */
  const parts = ["export "];

  const isDefault = decl.default || decl.type === "ExportDefaultDeclaration";

  if (isDefault) {
    parts.push("default ");
  }

  parts.push(
    comments.printDanglingComments(path, options, /* sameIndent */ true)
  );

  if (needsHardlineAfterDanglingComment(decl)) {
    parts.push(hardline);
  }

  if (decl.declaration) {
    parts.push(path.call(print, "declaration"));

    if (
      isDefault &&
      decl.declaration.type !== "ClassDeclaration" &&
      decl.declaration.type !== "FunctionDeclaration" &&
      decl.declaration.type !== "TSInterfaceDeclaration" &&
      decl.declaration.type !== "DeclareClass" &&
      decl.declaration.type !== "DeclareFunction" &&
      decl.declaration.type !== "TSDeclareFunction" &&
      decl.declaration.type !== "EnumDeclaration"
    ) {
      parts.push(semi);
    }
  } else {
    parts.push(decl.exportKind === "type" ? "type " : "");
    parts.push(printModuleSpecifiers(path, options, print));
    parts.push(printModuleSource(path, options, print));
    parts.push(semi);
  }

  return concat(parts);
}

function printFlowDeclaration(path, parts) {
  const parentExportDecl = getParentExportDeclaration(path);

  if (parentExportDecl) {
    assert.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
  } else {
    // If the parent node has type DeclareExportDeclaration, then it
    // will be responsible for printing the "declare" token. Otherwise
    // it needs to be printed with this non-exported declaration node.
    parts.unshift("declare ");
  }

  return concat(parts);
}

function printTypeScriptModifiers(path, options, print) {
  const n = path.getValue();
  if (!n.modifiers || !n.modifiers.length) {
    return "";
  }
  return concat([join(" ", path.map(print, "modifiers")), " "]);
}

const typeParametersGroupIds = new WeakMap();
function getTypeParametersGroupId(node) {
  if (!typeParametersGroupIds.has(node)) {
    typeParametersGroupIds.set(node, Symbol("typeParameters"));
  }
  return typeParametersGroupIds.get(node);
}

function printTypeParameters(path, options, print, paramsKey) {
  const n = path.getValue();

  if (!n[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(n[paramsKey])) {
    return path.call(print, paramsKey);
  }

  const grandparent = path.getNode(2);
  const isParameterInTestCall = grandparent != null && isTestCall(grandparent);

  const shouldInline =
    isParameterInTestCall ||
    n[paramsKey].length === 0 ||
    (n[paramsKey].length === 1 &&
      (shouldHugType(n[paramsKey][0]) ||
        (n[paramsKey][0].type === "GenericTypeAnnotation" &&
          shouldHugType(n[paramsKey][0].id)) ||
        (n[paramsKey][0].type === "TSTypeReference" &&
          shouldHugType(n[paramsKey][0].typeName)) ||
        n[paramsKey][0].type === "NullableTypeAnnotation"));

  function printDanglingCommentsForInline(n) {
    if (!hasDanglingComments(n)) {
      return "";
    }
    const hasOnlyBlockComments = n.comments.every((comment) =>
      handleComments.isBlockComment(comment)
    );
    const printed = comments.printDanglingComments(
      path,
      options,
      /* sameIndent */ hasOnlyBlockComments
    );
    if (hasOnlyBlockComments) {
      return printed;
    }
    return concat([printed, hardline]);
  }

  if (shouldInline) {
    return concat([
      "<",
      join(", ", path.map(print, paramsKey)),
      printDanglingCommentsForInline(n),
      ">",
    ]);
  }

  return group(
    concat([
      "<",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.map(print, paramsKey)),
        ])
      ),
      ifBreak(
        options.parser !== "typescript" &&
          options.parser !== "babel-ts" &&
          shouldPrintComma(options, "all")
          ? ","
          : ""
      ),
      softline,
      ">",
    ]),
    { id: getTypeParametersGroupId(n) }
  );
}

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.abstract) {
    parts.push("abstract ");
  }

  parts.push("class");

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    (n.id && hasTrailingComment(n.id)) ||
    (n.superClass &&
      n.superClass.comments &&
      n.superClass.comments.length !== 0) ||
    (n.extends && n.extends.length !== 0) || // DeclareClass
    (n.mixins && n.mixins.length !== 0) ||
    (n.implements && n.implements.length !== 0);

  const partsGroup = [];
  const extendsParts = [];

  if (n.id) {
    partsGroup.push(" ", path.call(print, "id"));
  }

  partsGroup.push(path.call(print, "typeParameters"));

  const hasMultipleHeritage =
    ["superClass", "extends", "mixins", "implements"].filter((key) => !!n[key])
      .length > 1;
  const shouldIndentOnlyHeritageClauses =
    n.typeParameters &&
    !hasTrailingLineComment(n.typeParameters) &&
    !hasMultipleHeritage;

  function printList(listName) {
    if (n[listName] && n[listName].length !== 0) {
      const printedLeadingComments = comments.printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        ({ marker }) => marker === listName
      );
      extendsParts.push(
        shouldIndentOnlyHeritageClauses
          ? ifBreak(" ", line, {
              groupId: getTypeParametersGroupId(n.typeParameters),
            })
          : line,
        printedLeadingComments,
        printedLeadingComments && hardline,
        listName,
        group(
          indent(
            concat([line, join(concat([",", line]), path.map(print, listName))])
          )
        )
      );
    }
  }

  if (n.superClass) {
    const printSuperClass = (path) => {
      const printed = path.call(print, "superClass");
      const parent = path.getParentNode();
      if (parent && parent.type === "AssignmentExpression") {
        return concat([
          ifBreak("("),
          indent(concat([softline, printed])),
          softline,
          ifBreak(")"),
        ]);
      }
      return printed;
    };
    const printed = concat([
      "extends ",
      printSuperClass(path),
      path.call(print, "superTypeParameters"),
    ]);
    const printedWithComments = path.call(
      (superClass) =>
        comments.printComments(superClass, () => printed, options),
      "superClass"
    );
    if (groupMode) {
      extendsParts.push(line, group(printedWithComments));
    } else {
      extendsParts.push(" ", printedWithComments);
    }
  } else {
    printList("extends");
  }

  printList("mixins");
  printList("implements");

  if (groupMode) {
    const printedExtends = concat(extendsParts);
    if (shouldIndentOnlyHeritageClauses) {
      parts.push(
        group(
          concat(
            partsGroup.concat(ifBreak(indent(printedExtends), printedExtends))
          )
        )
      );
    } else {
      parts.push(group(indent(concat(partsGroup.concat(printedExtends)))));
    }
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", path.call(print, "body"));

  return parts;
}

function separatorNoWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode
) {
  if (isFacebookTranslationTag) {
    return "";
  }

  if (
    (childNode.type === "JSXElement" && !childNode.closingElement) ||
    (nextNode && nextNode.type === "JSXElement" && !nextNode.closingElement)
  ) {
    return child.length === 1 ? softline : hardline;
  }

  return softline;
}

function separatorWithWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode
) {
  if (isFacebookTranslationTag) {
    return hardline;
  }

  if (child.length === 1) {
    return (childNode.type === "JSXElement" && !childNode.closingElement) ||
      (nextNode && nextNode.type === "JSXElement" && !nextNode.closingElement)
      ? hardline
      : softline;
  }

  return hardline;
}

// JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// Leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
//
// We print JSX using the `fill` doc primitive.
// This requires that we give it an array of alternating
// content and whitespace elements.
// To ensure this we add dummy `""` content elements as needed.
function printJSXChildren(
  path,
  options,
  print,
  jsxWhitespace,
  isFacebookTranslationTag
) {
  const n = path.getValue();
  const children = [];

  path.each((childPath, i) => {
    const child = childPath.getValue();
    if (isLiteral(child)) {
      const text = rawText(child);

      // Contains a non-whitespace character
      if (isMeaningfulJSXText(child)) {
        const words = text.split(matchJsxWhitespaceRegex);

        // Starts with whitespace
        if (words[0] === "") {
          children.push("");
          words.shift();
          if (/\n/.test(words[0])) {
            const next = n.children[i + 1];
            children.push(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                words[1],
                child,
                next
              )
            );
          } else {
            children.push(jsxWhitespace);
          }
          words.shift();
        }

        let endWhitespace;
        // Ends with whitespace
        if (getLast(words) === "") {
          words.pop();
          endWhitespace = words.pop();
        }

        // This was whitespace only without a new line.
        if (words.length === 0) {
          return;
        }

        words.forEach((word, i) => {
          if (i % 2 === 1) {
            children.push(line);
          } else {
            children.push(word);
          }
        });

        if (endWhitespace !== undefined) {
          if (/\n/.test(endWhitespace)) {
            const next = n.children[i + 1];
            children.push(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                getLast(children),
                child,
                next
              )
            );
          } else {
            children.push(jsxWhitespace);
          }
        } else {
          const next = n.children[i + 1];
          children.push(
            separatorNoWhitespace(
              isFacebookTranslationTag,
              getLast(children),
              child,
              next
            )
          );
        }
      } else if (/\n/.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/g).length > 1) {
          children.push("");
          children.push(hardline);
        }
      } else {
        children.push("");
        children.push(jsxWhitespace);
      }
    } else {
      const printedChild = print(childPath);
      children.push(printedChild);

      const next = n.children[i + 1];
      const directlyFollowedByMeaningfulText =
        next && isMeaningfulJSXText(next);
      if (directlyFollowedByMeaningfulText) {
        const firstWord = rawText(next)
          .trim()
          .split(matchJsxWhitespaceRegex)[0];
        children.push(
          separatorNoWhitespace(
            isFacebookTranslationTag,
            firstWord,
            child,
            next
          )
        );
      } else {
        children.push(hardline);
      }
    }
  }, "children");

  return children;
}

// JSX expands children from the inside-out, instead of the outside-in.
// This is both to break children before attributes,
// and to ensure that when children break, their parents do as well.
//
// Any element that is written without any newlines and fits on a single line
// is left that way.
// Not only that, any user-written-line containing multiple JSX siblings
// should also be kept on one line if possible,
// so each user-written-line is wrapped in its own group.
//
// Elements that contain newlines or don't fit on a single line (recursively)
// are fully-split, using hardline and shouldBreak: true.
//
// To support that case properly, all leading and trailing spaces
// are stripped from the list of children, and replaced with a single hardline.
function printJSXElement(path, options, print) {
  const n = path.getValue();

  if (n.type === "JSXElement" && isEmptyJSXElement(n)) {
    return concat([
      path.call(print, "openingElement"),
      path.call(print, "closingElement"),
    ]);
  }

  const openingLines =
    n.type === "JSXElement"
      ? path.call(print, "openingElement")
      : path.call(print, "openingFragment");
  const closingLines =
    n.type === "JSXElement"
      ? path.call(print, "closingElement")
      : path.call(print, "closingFragment");

  if (
    n.children.length === 1 &&
    n.children[0].type === "JSXExpressionContainer" &&
    (n.children[0].expression.type === "TemplateLiteral" ||
      n.children[0].expression.type === "TaggedTemplateExpression")
  ) {
    return concat([
      openingLines,
      concat(path.map(print, "children")),
      closingLines,
    ]);
  }

  // Convert `{" "}` to text nodes containing a space.
  // This makes it easy to turn them into `jsxWhitespace` which
  // can then print as either a space or `{" "}` when breaking.
  n.children = n.children.map((child) => {
    if (isJSXWhitespaceExpression(child)) {
      return {
        type: "JSXText",
        value: " ",
        raw: " ",
      };
    }
    return child;
  });

  const containsTag = n.children.filter((child) => isJSXNode(child)).length > 0;
  const containsMultipleExpressions =
    n.children.filter((child) => child.type === "JSXExpressionContainer")
      .length > 1;
  const containsMultipleAttributes =
    n.type === "JSXElement" && n.openingElement.attributes.length > 1;

  // Record any breaks. Should never go from true to false, only false to true.
  let forcedBreak =
    willBreak(openingLines) ||
    containsTag ||
    containsMultipleAttributes ||
    containsMultipleExpressions;

  const isMdxBlock = path.getParentNode().rootMarker === "mdx";

  const rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  const jsxWhitespace = isMdxBlock
    ? concat([" "])
    : ifBreak(concat([rawJsxWhitespace, softline]), " ");

  const isFacebookTranslationTag =
    n.openingElement &&
    n.openingElement.name &&
    n.openingElement.name.name === "fbt";

  const children = printJSXChildren(
    path,
    options,
    print,
    jsxWhitespace,
    isFacebookTranslationTag
  );

  const containsText = n.children.some((child) => isMeaningfulJSXText(child));

  // We can end up we multiple whitespace elements with empty string
  // content between them.
  // We need to remove empty whitespace and softlines before JSX whitespace
  // to get the correct output.
  for (let i = children.length - 2; i >= 0; i--) {
    const isPairOfEmptyStrings = children[i] === "" && children[i + 1] === "";
    const isPairOfHardlines =
      children[i] === hardline &&
      children[i + 1] === "" &&
      children[i + 2] === hardline;
    const isLineFollowedByJSXWhitespace =
      (children[i] === softline || children[i] === hardline) &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isJSXWhitespaceFollowedByLine =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      (children[i + 2] === softline || children[i + 2] === hardline);
    const isDoubleJSXWhitespace =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isPairOfHardOrSoftLines =
      (children[i] === softline &&
        children[i + 1] === "" &&
        children[i + 2] === hardline) ||
      (children[i] === hardline &&
        children[i + 1] === "" &&
        children[i + 2] === softline);

    if (
      (isPairOfHardlines && containsText) ||
      isPairOfEmptyStrings ||
      isLineFollowedByJSXWhitespace ||
      isDoubleJSXWhitespace ||
      isPairOfHardOrSoftLines
    ) {
      children.splice(i, 2);
    } else if (isJSXWhitespaceFollowedByLine) {
      children.splice(i + 1, 2);
    }
  }

  // Trim trailing lines (or empty strings)
  while (
    children.length &&
    (isLineNext(getLast(children)) || isEmpty(getLast(children)))
  ) {
    children.pop();
  }

  // Trim leading lines (or empty strings)
  while (
    children.length &&
    (isLineNext(children[0]) || isEmpty(children[0])) &&
    (isLineNext(children[1]) || isEmpty(children[1]))
  ) {
    children.shift();
    children.shift();
  }

  // Tweak how we format children if outputting this element over multiple lines.
  // Also detect whether we will force this element to output over multiple lines.
  const multilineChildren = [];
  children.forEach((child, i) => {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && children[i - 1] === "") {
        if (children.length === 2) {
          // Solitary whitespace
          multilineChildren.push(rawJsxWhitespace);
          return;
        }
        // Leading whitespace
        multilineChildren.push(concat([rawJsxWhitespace, hardline]));
        return;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push(rawJsxWhitespace);
        return;
      } else if (children[i - 1] === "" && children[i - 2] === hardline) {
        // Whitespace after line break
        multilineChildren.push(rawJsxWhitespace);
        return;
      }
    }

    multilineChildren.push(child);

    if (willBreak(child)) {
      forcedBreak = true;
    }
  });

  // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.
  const content = containsText
    ? fill(multilineChildren)
    : group(concat(multilineChildren), { shouldBreak: true });

  if (isMdxBlock) {
    return content;
  }

  const multiLineElem = group(
    concat([
      openingLines,
      indent(concat([hardline, content])),
      hardline,
      closingLines,
    ])
  );

  if (forcedBreak) {
    return multiLineElem;
  }

  return conditionalGroup([
    group(concat([openingLines, concat(children), closingLines])),
    multiLineElem,
  ]);
}

function maybeWrapJSXElementInParens(path, elem, options) {
  const parent = path.getParentNode();
  /* istanbul ignore next */
  if (!parent) {
    return elem;
  }

  const NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXAttribute: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    JSXFragment: true,
    ExpressionStatement: true,
    CallExpression: true,
    OptionalCallExpression: true,
    ConditionalExpression: true,
    JsExpressionRoot: true,
  };
  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  const shouldBreak = path.match(
    undefined,
    (node) => node.type === "ArrowFunctionExpression",
    isCallOrOptionalCallExpression,
    (node) => node.type === "JSXExpressionContainer"
  );

  const needsParens = pathNeedsParens(path, options);

  return group(
    concat([
      needsParens ? "" : ifBreak("("),
      indent(concat([softline, elem])),
      softline,
      needsParens ? "" : ifBreak(")"),
    ]),
    { shouldBreak }
  );
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (
    node.right.type === "ObjectExpression" &&
    node.right.properties.length !== 0
  ) {
    return true;
  }

  if (
    node.right.type === "ArrayExpression" &&
    node.right.elements.length !== 0
  ) {
    return true;
  }

  if (isJSXNode(node.right)) {
    return true;
  }

  return false;
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(
  path,
  print,
  options,
  isNested,
  isInsideParenthesis
) {
  /** @type{Doc[]} */
  let parts = [];

  const node = path.getValue();

  // We treat BinaryExpression and LogicalExpression nodes the same.
  if (isBinaryish(node)) {
    // Put all operators with the same precedence level in the same
    // group. The reason we only need to do this with the `left`
    // expression is because given an expression like `1 + 2 - 3`, it
    // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
    // is where the rest of the expression will exist. Binary
    // expressions on the right side mean they have a difference
    // precedence level and should be treated as a separate group, so
    // print them normally. (This doesn't hold for the `**` operator,
    // which is unique in that it is right-associative.)
    if (shouldFlatten(node.operator, node.left.operator)) {
      // Flatten them out by recursively calling this function.
      parts = parts.concat(
        path.call(
          (left) =>
            printBinaryishExpressions(
              left,
              print,
              options,
              /* isNested */ true,
              isInsideParenthesis
            ),
          "left"
        )
      );
    } else {
      parts.push(group(path.call(print, "left")));
    }

    const shouldInline = shouldInlineLogicalExpression(node);
    const lineBeforeOperator =
      (node.operator === "|>" ||
        node.type === "NGPipeExpression" ||
        (node.operator === "|" && options.parser === "__vue_expression")) &&
      !hasLeadingOwnLineComment(options.originalText, node.right);

    const operator = node.type === "NGPipeExpression" ? "|" : node.operator;
    const rightSuffix =
      node.type === "NGPipeExpression" && node.arguments.length !== 0
        ? group(
            indent(
              concat([
                softline,
                ": ",
                join(
                  concat([softline, ":", ifBreak(" ")]),
                  path
                    .map(print, "arguments")
                    .map((arg) => align(2, group(arg)))
                ),
              ])
            )
          )
        : "";

    const right = shouldInline
      ? concat([operator, " ", path.call(print, "right"), rightSuffix])
      : concat([
          lineBeforeOperator ? line : "",
          operator,
          lineBeforeOperator ? " " : line,
          path.call(print, "right"),
          rightSuffix,
        ]);

    // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.
    const parent = path.getParentNode();
    const shouldBreak = hasTrailingLineComment(node.left);
    const shouldGroup =
      shouldBreak ||
      (!(isInsideParenthesis && node.type === "LogicalExpression") &&
        parent.type !== node.type &&
        node.left.type !== node.type &&
        node.right.type !== node.type);

    parts.push(
      lineBeforeOperator ? "" : " ",
      shouldGroup ? group(right, { shouldBreak }) : right
    );

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    if (isNested && node.comments) {
      parts = normalizeParts(
        comments.printComments(path, () => concat(parts), options).parts
      );
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(group(path.call(print)));
  }

  return parts;
}

function printAssignmentRight(leftNode, rightNode, printedRight, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return indent(concat([line, printedRight]));
  }

  const canBreak =
    (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) ||
    (rightNode.type === "ConditionalExpression" &&
      isBinaryish(rightNode.test) &&
      !shouldInlineLogicalExpression(rightNode.test)) ||
    rightNode.type === "StringLiteralTypeAnnotation" ||
    (rightNode.type === "ClassExpression" &&
      rightNode.decorators &&
      rightNode.decorators.length) ||
    ((leftNode.type === "Identifier" ||
      isStringLiteral(leftNode) ||
      leftNode.type === "MemberExpression") &&
      (isStringLiteral(rightNode) || isMemberExpressionChain(rightNode)) &&
      // do not put values on a separate line from the key in json
      options.parser !== "json" &&
      options.parser !== "json5") ||
    rightNode.type === "SequenceExpression";

  if (canBreak) {
    return group(indent(concat([line, printedRight])));
  }

  return concat([" ", printedRight]);
}

function printAssignment(
  leftNode,
  printedLeft,
  operator,
  rightNode,
  printedRight,
  options
) {
  if (!rightNode) {
    return printedLeft;
  }

  const printed = printAssignmentRight(
    leftNode,
    rightNode,
    printedRight,
    options
  );

  return group(concat([printedLeft, operator, printed]));
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat([" ", clause]);
  }

  return indent(concat([line, clause]));
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

function exprNeedsASIProtection(path, options) {
  const node = path.getValue();

  const maybeASIProblem =
    pathNeedsParens(path, options) ||
    node.type === "ParenthesizedExpression" ||
    node.type === "TypeCastExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      !shouldPrintParamsWithoutParens(path, options)) ||
    node.type === "ArrayExpression" ||
    node.type === "ArrayPattern" ||
    (node.type === "UnaryExpression" &&
      node.prefix &&
      (node.operator === "+" || node.operator === "-")) ||
    node.type === "TemplateLiteral" ||
    node.type === "TemplateElement" ||
    isJSXNode(node) ||
    (node.type === "BindExpression" && !node.object) ||
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" && node.pattern) ||
    (node.type === "Literal" && node.regex);

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    (childPath) => exprNeedsASIProtection(childPath, options),
    ...getLeftSidePathName(path, node)
  );
}

function stmtNeedsASIProtection(path, options) {
  const node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(
    (childPath) => exprNeedsASIProtection(childPath, options),
    "expression"
  );
}

function shouldHugType(node) {
  if (isSimpleType(node) || isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    const voidCount = node.types.filter(
      (n) =>
        n.type === "VoidTypeAnnotation" ||
        n.type === "TSVoidKeyword" ||
        n.type === "NullLiteralTypeAnnotation" ||
        n.type === "TSNullKeyword"
    ).length;

    const hasObject = node.types.some(
      (n) =>
        n.type === "ObjectTypeAnnotation" ||
        n.type === "TSTypeLiteral" ||
        // This is a bit aggressive but captures Array<{x}>
        n.type === "GenericTypeAnnotation" ||
        n.type === "TSTypeReference"
    );

    if (node.types.length - 1 === voidCount && hasObject) {
      return true;
    }
  }

  return false;
}

function shouldHugArguments(fun) {
  if (!fun) {
    return false;
  }
  const parameters = getFunctionParameters(fun);
  if (parameters.length !== 1) {
    return false;
  }
  const param = parameters[0];
  return (
    !param.comments &&
    (param.type === "ObjectPattern" ||
      param.type === "ArrayPattern" ||
      (param.type === "Identifier" &&
        param.typeAnnotation &&
        (param.typeAnnotation.type === "TypeAnnotation" ||
          param.typeAnnotation.type === "TSTypeAnnotation") &&
        isObjectType(param.typeAnnotation.typeAnnotation)) ||
      (param.type === "FunctionTypeParam" &&
        isObjectType(param.typeAnnotation)) ||
      (param.type === "AssignmentPattern" &&
        (param.left.type === "ObjectPattern" ||
          param.left.type === "ArrayPattern") &&
        (param.right.type === "Identifier" ||
          (param.right.type === "ObjectExpression" &&
            param.right.properties.length === 0) ||
          (param.right.type === "ArrayExpression" &&
            param.right.elements.length === 0))))
  );
}

function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  path.each((childPath) => {
    printedElements.push(concat(separatorParts));
    printedElements.push(group(print(childPath)));

    separatorParts = [",", line];
    if (
      childPath.getValue() &&
      isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)
    ) {
      separatorParts.push(softline);
    }
  }, printPath);

  return concat(printedElements);
}

function printReturnAndThrowArgument(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = [];

  if (node.argument) {
    if (returnArgumentHasLeadingComment(options, node.argument)) {
      parts.push(
        concat([
          " (",
          indent(concat([hardline, path.call(print, "argument")])),
          hardline,
          ")",
        ])
      );
    } else if (
      isBinaryish(node.argument) ||
      node.argument.type === "SequenceExpression"
    ) {
      parts.push(
        group(
          concat([
            ifBreak(" (", " "),
            indent(concat([softline, path.call(print, "argument")])),
            softline,
            ifBreak(")"),
          ])
        )
      );
    } else {
      parts.push(" ", path.call(print, "argument"));
    }
  }

  const lastComment =
    Array.isArray(node.comments) && node.comments[node.comments.length - 1];
  const isLastCommentLine =
    lastComment &&
    (lastComment.type === "CommentLine" || lastComment.type === "Line");

  if (isLastCommentLine) {
    parts.push(semi);
  }

  if (hasDanglingComments(node)) {
    parts.push(
      " ",
      comments.printDanglingComments(path, options, /* sameIndent */ true)
    );
  }

  if (!isLastCommentLine) {
    parts.push(semi);
  }

  return concat(parts);
}

function willPrintOwnComments(path /*, options */) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    ((node &&
      (isJSXNode(node) ||
        hasFlowShorthandAnnotationComment(node) ||
        (parent &&
          (parent.type === "CallExpression" ||
            parent.type === "OptionalCallExpression") &&
          (hasFlowAnnotationComment(node.leadingComments) ||
            hasFlowAnnotationComment(node.trailingComments))))) ||
      (parent &&
        (parent.type === "JSXSpreadAttribute" ||
          parent.type === "JSXSpreadChild" ||
          parent.type === "UnionTypeAnnotation" ||
          parent.type === "TSUnionType" ||
          ((parent.type === "ClassDeclaration" ||
            parent.type === "ClassExpression") &&
            parent.superClass === node)))) &&
    (!hasIgnoreComment(path) ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType")
  );
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

function printComment(commentPath, options) {
  const comment = commentPath.getValue();

  switch (comment.type) {
    case "CommentBlock":
    case "Block": {
      if (isIndentableBlockComment(comment)) {
        const printed = printIndentableBlockComment(comment);
        // We need to prevent an edge case of a previous trailing comment
        // printed as a `lineSuffix` which causes the comments to be
        // interleaved. See https://github.com/prettier/prettier/issues/4412
        if (
          comment.trailing &&
          !hasNewline(options.originalText, locStart(comment), {
            backwards: true,
          })
        ) {
          return concat([hardline, printed]);
        }
        return printed;
      }

      const commentEnd = locEnd(comment);
      const isInsideFlowComment =
        options.originalText.slice(commentEnd - 3, commentEnd) === "*-/";

      return "/*" + comment.value + (isInsideFlowComment ? "*-/" : "*/");
    }
    case "CommentLine":
    case "Line":
      // Supports `//`, `#!`, `<!--`, and `-->`
      return options.originalText
        .slice(locStart(comment), locEnd(comment))
        .trimEnd();
    default:
      /* istanbul ignore next */
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function isIndentableBlockComment(comment) {
  // If the comment has multiple lines and every line starts with a star
  // we can fix the indentation of each line. The stars in the `/*` and
  // `*/` delimiters are not included in the comment value, so add them
  // back first.
  const lines = `*${comment.value}*`.split("\n");
  return lines.length > 1 && lines.every((line) => line.trim()[0] === "*");
}

function printIndentableBlockComment(comment) {
  const lines = comment.value.split("\n");

  return concat([
    "/*",
    join(
      hardline,
      lines.map((line, index) =>
        index === 0
          ? line.trimEnd()
          : " " + (index < lines.length - 1 ? line.trim() : line.trimStart())
      )
    ),
    "*/",
  ]);
}

module.exports = {
  preprocess,
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  hasPrettierIgnore,
  willPrintOwnComments,
  canAttachComment,
  printComment,
  isBlockComment: handleComments.isBlockComment,
  handleComments: {
    ownLine: handleComments.handleOwnLineComment,
    endOfLine: handleComments.handleEndOfLineComment,
    remaining: handleComments.handleRemainingComment,
  },
  getGapRegex: handleComments.getGapRegex,
  getCommentChildNodes: handleComments.getCommentChildNodes,
};
