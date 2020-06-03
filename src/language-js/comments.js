"use strict";

const privateUtil = require("../common/util");
const {
  addLeadingComment,
  addTrailingComment,
  addDanglingComment,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../common/util-shared");

function handleOwnLineComment(comment, text, options, ast, isLastComment) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  return (
    handleLastFunctionArgComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleMemberExpressionComments(enclosingNode, followingNode, comment) ||
    handleIfStatementComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleWhileComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleTryStatementComments(
      enclosingNode,
      precedingNode,
      followingNode,
      comment
    ) ||
    handleClassComments(enclosingNode, precedingNode, followingNode, comment) ||
    handleImportSpecifierComments(enclosingNode, comment) ||
    handleForComments(enclosingNode, precedingNode, comment) ||
    handleUnionTypeComments(
      precedingNode,
      enclosingNode,
      followingNode,
      comment
    ) ||
    handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
    handleImportDeclarationComments(
      text,
      enclosingNode,
      precedingNode,
      comment,
      options
    ) ||
    handleAssignmentPatternComments(enclosingNode, comment) ||
    handleMethodNameComments(
      text,
      enclosingNode,
      precedingNode,
      comment,
      options
    ) ||
    handleLabeledStatementComments(enclosingNode, comment)
  );
}

function handleEndOfLineComment(comment, text, options, ast, isLastComment) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  return (
    handleClosureTypeCastComments(followingNode, comment) ||
    handleLastFunctionArgComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleConditionalExpressionComments(
      enclosingNode,
      precedingNode,
      followingNode,
      comment,
      text,
      options
    ) ||
    handleImportSpecifierComments(enclosingNode, comment) ||
    handleIfStatementComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleWhileComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleTryStatementComments(
      enclosingNode,
      precedingNode,
      followingNode,
      comment
    ) ||
    handleClassComments(enclosingNode, precedingNode, followingNode, comment) ||
    handleLabeledStatementComments(enclosingNode, comment) ||
    handleCallExpressionComments(precedingNode, enclosingNode, comment) ||
    handlePropertyComments(enclosingNode, comment) ||
    handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
    handleTypeAliasComments(enclosingNode, followingNode, comment) ||
    handleVariableDeclaratorComments(enclosingNode, followingNode, comment) ||
    handleBinaryExpression(enclosingNode, followingNode, comment)
  );
}

function handleRemainingComment(comment, text, options, ast, isLastComment) {
  const { precedingNode, enclosingNode, followingNode } = comment;

  if (
    handleIfStatementComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleWhileComments(
      text,
      precedingNode,
      enclosingNode,
      followingNode,
      comment,
      options
    ) ||
    handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) ||
    handleCommentInEmptyParens(text, enclosingNode, comment, options) ||
    handleMethodNameComments(
      text,
      enclosingNode,
      precedingNode,
      comment,
      options
    ) ||
    handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
    handleCommentAfterArrowParams(text, enclosingNode, comment, options) ||
    handleFunctionNameComments(
      text,
      enclosingNode,
      precedingNode,
      comment,
      options
    ) ||
    handleTSMappedTypeComments(
      text,
      enclosingNode,
      precedingNode,
      followingNode,
      comment
    ) ||
    handleBreakAndContinueStatementComments(enclosingNode, comment) ||
    handleTSFunctionTrailingComments(
      text,
      enclosingNode,
      followingNode,
      comment,
      options
    )
  ) {
    return true;
  }
  return false;
}

function addBlockStatementFirstComment(node, comment) {
  const body = (node.body || node.properties).filter(
    (n) => n.type !== "EmptyStatement"
  );
  if (body.length === 0) {
    addDanglingComment(node, comment);
  } else {
    addLeadingComment(body[0], comment);
  }
}

function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
  }
}

function handleClosureTypeCastComments(followingNode, comment) {
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
function handleIfStatementComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment,
  options
) {
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
  const nextCharacter = privateUtil.getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    options.locEnd
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

function handleWhileComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment,
  options
) {
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
  const nextCharacter = privateUtil.getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    options.locEnd
  );
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  return false;
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments(
  enclosingNode,
  precedingNode,
  followingNode,
  comment
) {
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

function handleMemberExpressionComments(enclosingNode, followingNode, comment) {
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

function handleConditionalExpressionComments(
  enclosingNode,
  precedingNode,
  followingNode,
  comment,
  text,
  options
) {
  const isSameLineAsPrecedingNode =
    precedingNode &&
    !privateUtil.hasNewlineInRange(
      text,
      options.locEnd(precedingNode),
      options.locStart(comment)
    );

  if (
    (!precedingNode || !isSameLineAsPrecedingNode) &&
    enclosingNode &&
    enclosingNode.type === "ConditionalExpression" &&
    followingNode
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) {
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

function handleClassComments(
  enclosingNode,
  precedingNode,
  followingNode,
  comment
) {
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

function handleMethodNameComments(
  text,
  enclosingNode,
  precedingNode,
  comment,
  options
) {
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
    privateUtil.getNextNonSpaceNonCommentCharacter(
      text,
      precedingNode,
      options.locEnd
    ) !== ":"
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

function handleFunctionNameComments(
  text,
  enclosingNode,
  precedingNode,
  comment,
  options
) {
  if (
    privateUtil.getNextNonSpaceNonCommentCharacter(
      text,
      comment,
      options.locEnd
    ) !== "("
  ) {
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

function handleCommentAfterArrowParams(text, enclosingNode, comment, options) {
  if (!(enclosingNode && enclosingNode.type === "ArrowFunctionExpression")) {
    return false;
  }

  const index = getNextNonSpaceNonCommentCharacterIndex(
    text,
    comment,
    options.locEnd
  );
  if (text.slice(index, index + 2) === "=>") {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleCommentInEmptyParens(text, enclosingNode, comment, options) {
  if (
    privateUtil.getNextNonSpaceNonCommentCharacter(
      text,
      comment,
      options.locEnd
    ) !== ")"
  ) {
    return false;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.
  if (
    enclosingNode &&
    ((isRealFunctionLikeNode(enclosingNode) &&
      // `params` vs `parameters` - see https://github.com/babel/babel/issues/9231
      (enclosingNode.params || enclosingNode.parameters).length === 0) ||
      ((enclosingNode.type === "CallExpression" ||
        enclosingNode.type === "OptionalCallExpression" ||
        enclosingNode.type === "NewExpression") &&
        enclosingNode.arguments.length === 0))
  ) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
  if (
    enclosingNode &&
    enclosingNode.type === "MethodDefinition" &&
    enclosingNode.value.params.length === 0
  ) {
    addDanglingComment(enclosingNode.value, comment);
    return true;
  }
  return false;
}

function handleLastFunctionArgComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment,
  options
) {
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
    enclosingNode &&
    isRealFunctionLikeNode(enclosingNode) &&
    privateUtil.getNextNonSpaceNonCommentCharacter(
      text,
      comment,
      options.locEnd
    ) === ")"
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
      if ((enclosingNode.params || enclosingNode.parameters).length !== 0) {
        return privateUtil.getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
          text,
          options.locEnd(
            privateUtil.getLast(
              enclosingNode.params || enclosingNode.parameters
            )
          )
        );
      }
      const functionParamLeftParenIndex = privateUtil.getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
        text,
        options.locEnd(enclosingNode.id)
      );
      return privateUtil.getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
        text,
        functionParamLeftParenIndex + 1
      );
    })();
    if (options.locStart(comment) > functionParamRightParenIndex) {
      addBlockStatementFirstComment(followingNode, comment);
      return true;
    }
  }

  return false;
}

function handleImportSpecifierComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleLabeledStatementComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleBreakAndContinueStatementComments(enclosingNode, comment) {
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

function handleCallExpressionComments(precedingNode, enclosingNode, comment) {
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

function handleUnionTypeComments(
  precedingNode,
  enclosingNode,
  followingNode,
  comment
) {
  if (
    enclosingNode &&
    (enclosingNode.type === "UnionTypeAnnotation" ||
      enclosingNode.type === "TSUnionType")
  ) {
    if (privateUtil.isNodeIgnoreComment(comment)) {
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
    privateUtil.isNodeIgnoreComment(comment)
  ) {
    followingNode.types[0].prettierIgnore = true;
    comment.unignore = true;
  }

  return false;
}

function handlePropertyComments(enclosingNode, comment) {
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

function handleOnlyComments(enclosingNode, ast, comment, isLastComment) {
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

function handleForComments(enclosingNode, precedingNode, comment) {
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

function handleImportDeclarationComments(
  text,
  enclosingNode,
  precedingNode,
  comment,
  options
) {
  if (
    !precedingNode &&
    enclosingNode &&
    enclosingNode.type === "ImportDeclaration" &&
    (!enclosingNode.specifiers || enclosingNode.specifiers.length === 0)
  ) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
  if (
    precedingNode &&
    precedingNode.type === "ImportSpecifier" &&
    enclosingNode &&
    enclosingNode.type === "ImportDeclaration" &&
    privateUtil.hasNewline(text, options.locEnd(comment))
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleAssignmentPatternComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleTypeAliasComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleVariableDeclaratorComments(
  enclosingNode,
  followingNode,
  comment
) {
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

function handleTSFunctionTrailingComments(
  text,
  enclosingNode,
  followingNode,
  comment,
  options
) {
  if (
    !followingNode &&
    enclosingNode &&
    (enclosingNode.type === "TSMethodSignature" ||
      enclosingNode.type === "TSDeclareFunction" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    privateUtil.getNextNonSpaceNonCommentCharacter(
      text,
      comment,
      options.locEnd
    ) === ";"
  ) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleTSMappedTypeComments(
  text,
  enclosingNode,
  precedingNode,
  followingNode,
  comment
) {
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

function handleBinaryExpression(enclosingNode, followingNode, comment) {
  if (
    enclosingNode &&
    (enclosingNode.type === "LogicalExpression" ||
      enclosingNode.type === "BinaryExpression") &&
    followingNode &&
    isBlockComment(comment)
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function isBlockComment(comment) {
  return comment.type === "Block" || comment.type === "CommentBlock";
}

function hasLeadingComment(node, fn = () => true) {
  if (node.leadingComments) {
    return node.leadingComments.some(fn);
  }
  if (node.comments) {
    return node.comments.some((comment) => comment.leading && fn(comment));
  }
  return false;
}

function isRealFunctionLikeNode(node) {
  return (
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression" ||
    node.type === "FunctionDeclaration" ||
    node.type === "ObjectMethod" ||
    node.type === "ClassMethod" ||
    node.type === "TSDeclareFunction" ||
    node.type === "TSCallSignatureDeclaration" ||
    node.type === "TSConstructSignatureDeclaration" ||
    node.type === "TSConstructSignatureDeclaration" ||
    node.type === "TSMethodSignature" ||
    node.type === "TSConstructorType" ||
    node.type === "TSFunctionType" ||
    node.type === "TSDeclareMethod"
  );
}

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

function getCommentChildNodes(node, options) {
  // Prevent attaching comments to FunctionExpression in this case:
  //     class Foo {
  //       bar() // comment
  //       {
  //         baz();
  //       }
  //     }
  if (
    (options.parser === "typescript" || options.parser === "flow") &&
    node.type === "MethodDefinition" &&
    node.value &&
    node.value.type === "FunctionExpression" &&
    node.value.params.length === 0 &&
    !node.value.returnType &&
    (!node.value.typeParameters || node.value.typeParameters.length === 0) &&
    node.value.body
  ) {
    return [...(node.decorators || []), node.key, node.value.body];
  }
}

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

module.exports = {
  handleOwnLineComment,
  handleEndOfLineComment,
  handleRemainingComment,
  hasLeadingComment,
  isBlockComment,
  isTypeCastComment,
  getGapRegex,
  getCommentChildNodes,
};
