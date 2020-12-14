"use strict";

const {
  getLast,
  hasNewline,
  getNextNonSpaceNonCommentCharacterIndexWithStartIndex,
  getNextNonSpaceNonCommentCharacter,
  hasNewlineInRange,
  addLeadingComment,
  addTrailingComment,
  addDanglingComment,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../common/util");
const {
  isBlockComment,
  getFunctionParameters,
  getCallArguments,
  isPrettierIgnoreComment,
  isJSXNode,
  hasFlowShorthandAnnotationComment,
  hasFlowAnnotationComment,
  hasIgnoreComment,
} = require("./utils");
const { locStart, locEnd } = require("./loc");

/**
 * @typedef {import("./types/estree").Node} Node
 * @typedef {import("./types/estree").Comment} Comment
 * @typedef {import("../common/fast-path")} FastPath
 *
 * @typedef {Object} CommentContext
 * @property {Comment} comment
 * @property {Node} precedingNode
 * @property {Node} enclosingNode
 * @property {Node} followingNode
 * @property {string} text
 * @property {any} options
 * @property {Node} ast
 * @property {boolean} isLastComment
 */

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleOwnLineComment(context) {
  return [
    handleIgnoreComments,
    handleLastFunctionArgComments,
    handleMemberExpressionComments,
    handleIfStatementComments,
    handleWhileComments,
    handleTryStatementComments,
    handleClassComments,
    handleImportSpecifierComments,
    handleForComments,
    handleUnionTypeComments,
    handleOnlyComments,
    handleImportDeclarationComments,
    handleAssignmentPatternComments,
    handleMethodNameComments,
    handleLabeledStatementComments,
  ].some((fn) => fn(context));
}

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleEndOfLineComment(context) {
  return [
    handleClosureTypeCastComments,
    handleLastFunctionArgComments,
    handleConditionalExpressionComments,
    handleImportSpecifierComments,
    handleIfStatementComments,
    handleWhileComments,
    handleTryStatementComments,
    handleClassComments,
    handleLabeledStatementComments,
    handleCallExpressionComments,
    handlePropertyComments,
    handleOnlyComments,
    handleTypeAliasComments,
    handleVariableDeclaratorComments,
  ].some((fn) => fn(context));
}

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleRemainingComment(context) {
  return [
    handleIgnoreComments,
    handleIfStatementComments,
    handleWhileComments,
    handleObjectPropertyAssignment,
    handleCommentInEmptyParens,
    handleMethodNameComments,
    handleOnlyComments,
    handleCommentAfterArrowParams,
    handleFunctionNameComments,
    handleTSMappedTypeComments,
    handleBreakAndContinueStatementComments,
    handleTSFunctionTrailingComments,
  ].some((fn) => fn(context));
}

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockStatementFirstComment(node, comment) {
  // @ts-ignore
  const firstNonEmptyNode = (node.body || node.properties).find(
    ({ type }) => type !== "EmptyStatement"
  );
  if (firstNonEmptyNode) {
    addLeadingComment(firstNonEmptyNode, comment);
  } else {
    addDanglingComment(node, comment);
  }
}

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
  }
}

function handleClosureTypeCastComments({ comment, followingNode }) {
  if (followingNode && isTypeCastComment(comment)) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

// There are often comments before the else clause of if statements like
//
//   if (1) { ... }
//   // comment
//   else { ... }
//
// They are being attached as leading comments of the BlockExpression which
// is not well printed. What we want is to instead move the comment inside
// of the block and make it leadingComment of the first element of the block
// or dangling comment of the block if there is nothing inside
//
//   if (1) { ... }
//   else {
//     // comment
//     ...
//   }
function handleIfStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "IfStatement" ||
    !followingNode
  ) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   if (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    locEnd
  );
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Comments before `else`:
  // - treat as trailing comments of the consequent, if it's a BlockStatement
  // - treat as a dangling comment otherwise
  if (
    precedingNode === enclosingNode.consequent &&
    followingNode === enclosingNode.alternate
  ) {
    if (precedingNode.type === "BlockStatement") {
      addTrailingComment(precedingNode, comment);
    } else {
      addDanglingComment(enclosingNode, comment);
    }
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "IfStatement") {
    addBlockOrNotComment(followingNode.consequent, comment);
    return true;
  }

  // For comments positioned after the condition parenthesis in an if statement
  // before the consequent without brackets on, such as
  // if (a) /* comment */ true,
  // we look at the next character to see if the following node
  // is the consequent for the if statement
  if (enclosingNode.consequent === followingNode) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  return false;
}

function handleWhileComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "WhileStatement" ||
    !followingNode
  ) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   while (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    locEnd
  );
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (enclosingNode.body === followingNode) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  return false;
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    !enclosingNode ||
    (enclosingNode.type !== "TryStatement" &&
      enclosingNode.type !== "CatchClause") ||
    !followingNode
  ) {
    return false;
  }

  if (enclosingNode.type === "CatchClause" && precedingNode) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "TryStatement") {
    addBlockOrNotComment(followingNode.finalizer, comment);
    return true;
  }

  if (followingNode.type === "CatchClause") {
    addBlockOrNotComment(followingNode.body, comment);
    return true;
  }

  return false;
}

function handleMemberExpressionComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "MemberExpression" ||
      enclosingNode.type === "OptionalMemberExpression") &&
    followingNode &&
    followingNode.type === "Identifier"
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleConditionalExpressionComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  const isSameLineAsPrecedingNode =
    precedingNode &&
    !hasNewlineInRange(text, locEnd(precedingNode), locStart(comment));

  if (
    (!precedingNode || !isSameLineAsPrecedingNode) &&
    enclosingNode &&
    (enclosingNode.type === "ConditionalExpression" ||
      enclosingNode.type === "TSConditionalType") &&
    followingNode
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleObjectPropertyAssignment({
  comment,
  precedingNode,
  enclosingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ObjectProperty" ||
      enclosingNode.type === "Property") &&
    enclosingNode.shorthand &&
    enclosingNode.key === precedingNode &&
    enclosingNode.value.type === "AssignmentPattern"
  ) {
    addTrailingComment(enclosingNode.value.left, comment);
    return true;
  }
  return false;
}

function handleClassComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ClassDeclaration" ||
      enclosingNode.type === "ClassExpression" ||
      enclosingNode.type === "DeclareClass" ||
      enclosingNode.type === "DeclareInterface" ||
      enclosingNode.type === "InterfaceDeclaration" ||
      enclosingNode.type === "TSInterfaceDeclaration")
  ) {
    if (
      enclosingNode.decorators &&
      enclosingNode.decorators.length > 0 &&
      !(followingNode && followingNode.type === "Decorator")
    ) {
      addTrailingComment(
        enclosingNode.decorators[enclosingNode.decorators.length - 1],
        comment
      );
      return true;
    }

    if (enclosingNode.body && followingNode === enclosingNode.body) {
      addBlockStatementFirstComment(enclosingNode.body, comment);
      return true;
    }

    // Don't add leading comments to `implements`, `extends`, `mixins` to
    // avoid printing the comment after the keyword.
    if (followingNode) {
      for (const prop of ["implements", "extends", "mixins"]) {
        if (enclosingNode[prop] && followingNode === enclosingNode[prop][0]) {
          if (
            precedingNode &&
            (precedingNode === enclosingNode.id ||
              precedingNode === enclosingNode.typeParameters ||
              precedingNode === enclosingNode.superClass)
          ) {
            addTrailingComment(precedingNode, comment);
          } else {
            addDanglingComment(enclosingNode, comment, prop);
          }
          return true;
        }
      }
    }
  }
  return false;
}

function handleMethodNameComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (
    enclosingNode &&
    precedingNode &&
    // "MethodDefinition" is handled in getCommentChildNodes
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "TSDeclareMethod" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    precedingNode.type === "Identifier" &&
    enclosingNode.key === precedingNode &&
    // special Property case: { key: /*comment*/(value) };
    // comment should be attached to value instead of key
    getNextNonSpaceNonCommentCharacter(text, precedingNode, locEnd) !== ":"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Print comments between decorators and class methods as a trailing comment
  // on the decorator node instead of the method node
  if (
    precedingNode &&
    enclosingNode &&
    precedingNode.type === "Decorator" &&
    (enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "ClassProperty" ||
      enclosingNode.type === "FieldDefinition" ||
      enclosingNode.type === "TSAbstractClassProperty" ||
      enclosingNode.type === "TSAbstractMethodDefinition" ||
      enclosingNode.type === "TSDeclareMethod" ||
      enclosingNode.type === "MethodDefinition")
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

function handleFunctionNameComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (getNextNonSpaceNonCommentCharacter(text, comment, locEnd) !== "(") {
    return false;
  }
  if (
    precedingNode &&
    enclosingNode &&
    (enclosingNode.type === "FunctionDeclaration" ||
      enclosingNode.type === "FunctionExpression" ||
      enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "MethodDefinition" ||
      enclosingNode.type === "ObjectMethod")
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleCommentAfterArrowParams({ comment, enclosingNode, text }) {
  if (!(enclosingNode && enclosingNode.type === "ArrowFunctionExpression")) {
    return false;
  }

  const index = getNextNonSpaceNonCommentCharacterIndex(text, comment, locEnd);
  if (index !== false && text.slice(index, index + 2) === "=>") {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleCommentInEmptyParens({ comment, enclosingNode, text }) {
  if (getNextNonSpaceNonCommentCharacter(text, comment, locEnd) !== ")") {
    return false;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.
  const node = getEmptyFunctionParametersOrCallArgumentsNode(enclosingNode);
  if (node) {
    addDanglingComment(node, comment);
    return true;
  }

  return false;
}

function handleLastFunctionArgComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  // Flow function type definitions
  if (
    precedingNode &&
    precedingNode.type === "FunctionTypeParam" &&
    enclosingNode &&
    enclosingNode.type === "FunctionTypeAnnotation" &&
    followingNode &&
    followingNode.type !== "FunctionTypeParam"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Real functions and TypeScript function type definitions
  if (
    precedingNode &&
    (precedingNode.type === "Identifier" ||
      precedingNode.type === "AssignmentPattern") &&
    isFunctionLikeNode(enclosingNode) &&
    getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === ")"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (
    enclosingNode &&
    enclosingNode.type === "FunctionDeclaration" &&
    followingNode &&
    followingNode.type === "BlockStatement"
  ) {
    const functionParamRightParenIndex = (() => {
      const parameters = getFunctionParameters(enclosingNode);
      if (parameters.length !== 0) {
        return getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
          text,
          locEnd(getLast(parameters))
        );
      }
      const functionParamLeftParenIndex = getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
        text,
        locEnd(enclosingNode.id)
      );
      return (
        functionParamLeftParenIndex !== false &&
        getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
          text,
          functionParamLeftParenIndex + 1
        )
      );
    })();
    if (locStart(comment) > functionParamRightParenIndex) {
      addBlockStatementFirstComment(followingNode, comment);
      return true;
    }
  }

  return false;
}

function handleImportSpecifierComments({ comment, enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleLabeledStatementComments({ comment, enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleBreakAndContinueStatementComments({ comment, enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ContinueStatement" ||
      enclosingNode.type === "BreakStatement") &&
    !enclosingNode.label
  ) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleCallExpressionComments({
  comment,
  precedingNode,
  enclosingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "CallExpression" ||
      enclosingNode.type === "OptionalCallExpression") &&
    precedingNode &&
    enclosingNode.callee === precedingNode &&
    enclosingNode.arguments.length > 0
  ) {
    addLeadingComment(enclosingNode.arguments[0], comment);
    return true;
  }
  return false;
}

function handleUnionTypeComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "UnionTypeAnnotation" ||
      enclosingNode.type === "TSUnionType")
  ) {
    if (isPrettierIgnoreComment(comment)) {
      followingNode.prettierIgnore = true;
      comment.unignore = true;
    }
    if (precedingNode) {
      addTrailingComment(precedingNode, comment);
      return true;
    }
    return false;
  }

  if (
    followingNode &&
    (followingNode.type === "UnionTypeAnnotation" ||
      followingNode.type === "TSUnionType") &&
    isPrettierIgnoreComment(comment)
  ) {
    followingNode.types[0].prettierIgnore = true;
    comment.unignore = true;
  }

  return false;
}

function handlePropertyComments({ comment, enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "ObjectProperty")
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleOnlyComments({ comment, enclosingNode, ast, isLastComment }) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast && ast.body && ast.body.length === 0) {
    if (isLastComment) {
      addDanglingComment(ast, comment);
    } else {
      addLeadingComment(ast, comment);
    }
    return true;
  } else if (
    enclosingNode &&
    enclosingNode.type === "Program" &&
    enclosingNode.body.length === 0 &&
    enclosingNode.directives &&
    enclosingNode.directives.length === 0
  ) {
    if (isLastComment) {
      addDanglingComment(enclosingNode, comment);
    } else {
      addLeadingComment(enclosingNode, comment);
    }
    return true;
  }
  return false;
}

function handleForComments({ comment, enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ForInStatement" ||
      enclosingNode.type === "ForOfStatement")
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleImportDeclarationComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (
    precedingNode &&
    precedingNode.type === "ImportSpecifier" &&
    enclosingNode &&
    enclosingNode.type === "ImportDeclaration" &&
    hasNewline(text, locEnd(comment))
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleAssignmentPatternComments({ comment, enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleTypeAliasComments({ comment, enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleVariableDeclaratorComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "VariableDeclarator" ||
      enclosingNode.type === "AssignmentExpression") &&
    followingNode &&
    (followingNode.type === "ObjectExpression" ||
      followingNode.type === "ArrayExpression" ||
      followingNode.type === "TemplateLiteral" ||
      followingNode.type === "TaggedTemplateExpression" ||
      isBlockComment(comment))
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleTSFunctionTrailingComments({
  comment,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !followingNode &&
    enclosingNode &&
    (enclosingNode.type === "TSMethodSignature" ||
      enclosingNode.type === "TSDeclareFunction" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === ";"
  ) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleIgnoreComments({ comment, enclosingNode, followingNode }) {
  if (
    isPrettierIgnoreComment(comment) &&
    enclosingNode &&
    enclosingNode.type === "TSMappedType" &&
    followingNode &&
    followingNode.type === "TSTypeParameter" &&
    followingNode.constraint
  ) {
    enclosingNode.prettierIgnore = true;
    comment.unignore = true;
    return true;
  }
}

function handleTSMappedTypeComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (!enclosingNode || enclosingNode.type !== "TSMappedType") {
    return false;
  }

  if (
    followingNode &&
    followingNode.type === "TSTypeParameter" &&
    followingNode.name
  ) {
    addLeadingComment(followingNode.name, comment);
    return true;
  }

  if (
    precedingNode &&
    precedingNode.type === "TSTypeParameter" &&
    precedingNode.constraint
  ) {
    addTrailingComment(precedingNode.constraint, comment);
    return true;
  }

  return false;
}

const functionLikeNodeTypes = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
  "FunctionDeclaration",
  "ObjectMethod",
  "ClassMethod",
  "TSDeclareFunction",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSMethodSignature",
  "TSConstructorType",
  "TSFunctionType",
  "TSDeclareMethod",
]);
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFunctionLikeNode(node) {
  return node && functionLikeNodeTypes.has(node.type);
}
const valueFunctionLikeNodeTypes = new Set([
  "MethodDefinition",
  "TSAbstractMethodDefinition",
]);
const callLikeNodeTypes = new Set([
  "CallExpression",
  "OptionalCallExpression",
  "NewExpression",
]);
function getEmptyFunctionParametersOrCallArgumentsNode(node) {
  if (!node) {
    return;
  }

  if (isFunctionLikeNode(node) && getFunctionParameters(node).length === 0) {
    return node;
  }
  if (callLikeNodeTypes.has(node.type) && getCallArguments(node).length === 0) {
    return node;
  }
  if (
    valueFunctionLikeNodeTypes.has(node.type) &&
    getFunctionParameters(node.value).length === 0
  ) {
    return node.value;
  }
}

/**
 * @param {Node} enclosingNode
 * @returns {RegExp | void}
 */
function getGapRegex(enclosingNode) {
  if (
    enclosingNode &&
    enclosingNode.type !== "BinaryExpression" &&
    enclosingNode.type !== "LogicalExpression"
  ) {
    // Support degenerate single-element unions and intersections.
    // E.g.: `type A = /* 1 */ & B`
    return /^[\s&(|]*$/;
  }
}

/**
 * @param {any} node
 * @returns {Node[] | void}
 */
function getCommentChildNodes(node, options) {
  // Prevent attaching comments to FunctionExpression in this case:
  //     class Foo {
  //       bar() // comment
  //       {
  //         baz();
  //       }
  //     }
  if (
    (options.parser === "typescript" ||
      options.parser === "flow" ||
      options.parser === "espree" ||
      options.parser === "meriyah") &&
    node.type === "MethodDefinition" &&
    node.value &&
    node.value.type === "FunctionExpression" &&
    getFunctionParameters(node.value).length === 0 &&
    !node.value.returnType &&
    (!node.value.typeParameters || node.value.typeParameters.length === 0) &&
    node.value.body
  ) {
    return [...(node.decorators || []), node.key, node.value.body];
  }
}

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isTypeCastComment(comment) {
  return (
    isBlockComment(comment) &&
    comment.value[0] === "*" &&
    // TypeScript expects the type to be enclosed in curly brackets, however
    // Closure Compiler accepts types in parens and even without any delimiters at all.
    // That's why we just search for "@type".
    /@type\b/.test(comment.value)
  );
}

/**
 * @param {FastPath} path
 * @returns {boolean}
 */
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

module.exports = {
  handleOwnLineComment,
  handleEndOfLineComment,
  handleRemainingComment,
  isTypeCastComment,
  getGapRegex,
  getCommentChildNodes,
  willPrintOwnComments,
};
