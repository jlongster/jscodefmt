"use strict";

const getLast = require("../utils/get-last");
const {
  getFunctionParameters,
  getLeftSidePathName,
  hasFlowShorthandAnnotationComment,
  hasNakedLeftSide,
  hasNode,
  isBitwiseOperator,
  startsWithNoLookaheadToken,
  shouldFlatten,
  getPrecedence,
  isCallExpression,
  isMemberExpression,
  isObjectProperty,
} = require("./utils");

function needsParens(path, options) {
  const parent = path.getParentNode();
  if (!parent) {
    return false;
  }

  const name = path.getName();
  const node = path.getNode();

  // to avoid unexpected `}}` in HTML interpolations
  if (
    options.__isInHtmlInterpolation &&
    !options.bracketSpacing &&
    endsWithRightBracket(node) &&
    isFollowedByRightBracket(path)
  ) {
    return true;
  }

  // Only statements don't need parentheses.
  if (isStatement(node)) {
    return false;
  }

  if (
    // Preserve parens if we have a Flow annotation comment, unless we're using the Flow
    // parser. The Flow parser turns Flow comments into type annotation nodes in its
    // AST, which we handle separately.
    options.parser !== "flow" &&
    hasFlowShorthandAnnotationComment(path.getValue())
  ) {
    return true;
  }

  // Identifiers never need parentheses.
  if (node.type === "Identifier") {
    // ...unless those identifiers are embed placeholders. They might be substituted by complex
    // expressions, so the parens around them should not be dropped. Example (JS-in-HTML-in-JS):
    //     let tpl = html`<script> f((${expr}) / 2); </script>`;
    // If the inner JS formatter removes the parens, the expression might change its meaning:
    //     f((a + b) / 2)  vs  f(a + b / 2)
    if (
      node.extra &&
      node.extra.parenthesized &&
      /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(node.name)
    ) {
      return true;
    }

    // `for (async of []);` is invalid
    if (
      name === "left" &&
      node.name === "async" &&
      parent.type === "ForOfStatement" &&
      !parent.await
    ) {
      return true;
    }

    return false;
  }

  switch (parent.type) {
    case "ParenthesizedExpression":
      return false;
    case "ClassDeclaration":
    case "ClassExpression": {
      // Add parens around the extends clause of a class. It is needed for almost
      // all expressions.
      if (
        name === "superClass" &&
        (node.type === "ArrowFunctionExpression" ||
          node.type === "AssignmentExpression" ||
          node.type === "AwaitExpression" ||
          node.type === "BinaryExpression" ||
          node.type === "ConditionalExpression" ||
          node.type === "LogicalExpression" ||
          node.type === "NewExpression" ||
          node.type === "ObjectExpression" ||
          node.type === "ParenthesizedExpression" ||
          node.type === "SequenceExpression" ||
          node.type === "TaggedTemplateExpression" ||
          node.type === "UnaryExpression" ||
          node.type === "UpdateExpression" ||
          node.type === "YieldExpression" ||
          node.type === "TSNonNullExpression")
      ) {
        return true;
      }
      break;
    }
    case "ExportDefaultDeclaration": {
      return (
        // `export default function` or `export default class` can't be followed by
        // anything after. So an expression like `export default (function(){}).toString()`
        // needs to be followed by a parentheses
        shouldWrapFunctionForExportDefault(path, options) ||
        // `export default (foo, bar)` also needs parentheses
        node.type === "SequenceExpression"
      );
    }
    case "Decorator": {
      if (name === "expression") {
        let hasCallExpression = false;
        let hasMemberExpression = false;
        let current = node;
        while (current) {
          switch (current.type) {
            case "MemberExpression":
              hasMemberExpression = true;
              current = current.object;
              break;
            case "CallExpression":
              if (
                /** @(x().y) */ hasMemberExpression ||
                /** @(x().y()) */ hasCallExpression
              ) {
                return true;
              }
              hasCallExpression = true;
              current = current.callee;
              break;
            case "Identifier":
              return false;
            default:
              return true;
          }
        }
        return true;
      }
      break;
    }
    case "ExpressionStatement": {
      if (
        startsWithNoLookaheadToken(
          node,
          /* forbidFunctionClassAndDoExpr */ true
        )
      ) {
        return true;
      }
      break;
    }
    case "ArrowFunctionExpression": {
      if (
        name === "body" &&
        node.type !== "SequenceExpression" && // these have parens added anyway
        startsWithNoLookaheadToken(
          node,
          /* forbidFunctionClassAndDoExpr */ false
        )
      ) {
        return true;
      }
      break;
    }
  }

  switch (node.type) {
    case "UpdateExpression":
      if (parent.type === "UnaryExpression") {
        return (
          node.prefix &&
          ((node.operator === "++" && parent.operator === "+") ||
            (node.operator === "--" && parent.operator === "-"))
        );
      }
    // else fallthrough
    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return (
            node.operator === parent.operator &&
            (node.operator === "+" || node.operator === "-")
          );

        case "BindExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "BinaryExpression":
          return name === "left" && parent.operator === "**";

        case "TSNonNullExpression":
          return true;

        default:
          return false;
      }

    case "BinaryExpression": {
      if (
        parent.type === "UpdateExpression" ||
        (parent.type === "PipelineTopicExpression" && node.operator === "|>")
      ) {
        return true;
      }

      // We add parentheses to any `a in b` inside `ForStatement` initializer
      // https://github.com/prettier/prettier/issues/907#issuecomment-284304321
      if (node.operator === "in" && isPathInForStatementInitializer(path)) {
        return true;
      }
      if (node.operator === "|>" && node.extra && node.extra.parenthesized) {
        const grandParent = path.getParentNode(1);
        if (
          grandParent.type === "BinaryExpression" &&
          grandParent.operator === "|>"
        ) {
          return true;
        }
      }
    }
    // fallthrough
    case "TSTypeAssertion":
    case "TSAsExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "TSAsExpression":
          // example: foo as unknown as Bar
          return node.type !== "TSAsExpression";

        case "ConditionalExpression":
          return node.type === "TSAsExpression";

        case "CallExpression":
        case "NewExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "ClassExpression":
        case "ClassDeclaration":
          return name === "superClass";

        case "TSTypeAssertion":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "JSXSpreadAttribute":
        case "SpreadElement":
        case "SpreadProperty":
        case "BindExpression":
        case "AwaitExpression":
        case "TSNonNullExpression":
        case "UpdateExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "AssignmentExpression":
        case "AssignmentPattern":
          return (
            name === "left" &&
            (node.type === "TSTypeAssertion" || node.type === "TSAsExpression")
          );

        case "LogicalExpression":
          if (node.type === "LogicalExpression") {
            return parent.operator !== node.operator;
          }
        // else fallthrough

        case "BinaryExpression": {
          const { operator, type } = node;
          if (!operator && type !== "TSTypeAssertion") {
            return true;
          }

          const precedence = getPrecedence(operator);
          const parentOperator = parent.operator;
          const parentPrecedence = getPrecedence(parentOperator);

          if (parentPrecedence > precedence) {
            return true;
          }

          if (name === "right" && parentPrecedence === precedence) {
            return true;
          }

          if (
            parentPrecedence === precedence &&
            !shouldFlatten(parentOperator, operator)
          ) {
            return true;
          }

          if (parentPrecedence < precedence && operator === "%") {
            return parentOperator === "+" || parentOperator === "-";
          }

          // Add parenthesis when working with bitwise operators
          // It's not strictly needed but helps with code understanding
          if (isBitwiseOperator(parentOperator)) {
            return true;
          }

          return false;
        }

        default:
          return false;
      }

    case "SequenceExpression":
      switch (parent.type) {
        case "ReturnStatement":
          return false;

        case "ForStatement":
          // Although parentheses wouldn't hurt around sequence
          // expressions in the head of for loops, traditional style
          // dictates that e.g. i++, j++ should not be wrapped with
          // parentheses.
          return false;

        case "ExpressionStatement":
          return name !== "expression";

        case "ArrowFunctionExpression":
          // We do need parentheses, but SequenceExpressions are handled
          // specially when printing bodies of arrow functions.
          return name !== "body";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

    case "YieldExpression":
      if (
        parent.type === "UnaryExpression" ||
        parent.type === "AwaitExpression" ||
        parent.type === "TSAsExpression" ||
        parent.type === "TSNonNullExpression"
      ) {
        return true;
      }

      if (
        name === "expression" &&
        node.argument &&
        node.argument.type === "PipelinePrimaryTopicReference" &&
        parent.type === "PipelineTopicExpression"
      ) {
        return true;
      }

    // else fallthrough
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "BindExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "ConditionalExpression":
          return name === "test";

        case "BinaryExpression": {
          if (!node.argument && parent.operator === "|>") {
            return false;
          }

          return true;
        }

        default:
          return false;
      }

    case "TSConditionalType":
      if (name === "extendsType" && parent.type === "TSConditionalType") {
        return true;
      }
    // fallthrough
    case "TSFunctionType":
    case "TSConstructorType":
      if (name === "checkType" && parent.type === "TSConditionalType") {
        return true;
      }
    // fallthrough
    case "TSUnionType":
    case "TSIntersectionType":
      if (
        (parent.type === "TSUnionType" ||
          parent.type === "TSIntersectionType") &&
        parent.types.length > 1 &&
        (!node.types || node.types.length > 1)
      ) {
        return true;
      }
    // fallthrough
    case "TSInferType":
      if (node.type === "TSInferType" && parent.type === "TSRestType") {
        return false;
      }
    // fallthrough
    case "TSTypeOperator":
      return (
        parent.type === "TSArrayType" ||
        parent.type === "TSOptionalType" ||
        parent.type === "TSRestType" ||
        (name === "objectType" && parent.type === "TSIndexedAccessType") ||
        parent.type === "TSTypeOperator" ||
        (parent.type === "TSTypeAnnotation" &&
          /^TSJSDoc/.test(path.getParentNode(1).type))
      );

    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return (
        parent.type === "ArrayTypeAnnotation" ||
        parent.type === "NullableTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation" ||
        parent.type === "UnionTypeAnnotation" ||
        (name === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType"))
      );

    case "NullableTypeAnnotation":
      return (
        parent.type === "ArrayTypeAnnotation" ||
        (name === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType"))
      );

    case "FunctionTypeAnnotation": {
      const ancestor =
        parent.type === "NullableTypeAnnotation"
          ? path.getParentNode(1)
          : parent;

      return (
        ancestor.type === "UnionTypeAnnotation" ||
        ancestor.type === "IntersectionTypeAnnotation" ||
        ancestor.type === "ArrayTypeAnnotation" ||
        (name === "objectType" &&
          (ancestor.type === "IndexedAccessType" ||
            ancestor.type === "OptionalIndexedAccessType")) ||
        // We should check ancestor's parent to know whether the parentheses
        // are really needed, but since ??T doesn't make sense this check
        // will almost never be true.
        ancestor.type === "NullableTypeAnnotation" ||
        // See #5283
        (parent.type === "FunctionTypeParam" &&
          parent.name === null &&
          getFunctionParameters(node).some(
            (param) =>
              param.typeAnnotation &&
              param.typeAnnotation.type === "NullableTypeAnnotation"
          )) ||
        // If the return type is a nullable arrow function, then we need a paren
        // otherwise the inner => can be assumed to be for the outer one.
        (parent.type === "NullableTypeAnnotation" &&
          path.getParentNode(1).type === "TypeAnnotation" &&
          path.getParentNode(2).type === "ArrowFunctionExpression" &&
          path.getParentNode(2).returnType === path.getParentNode(1))
      );
    }

    case "OptionalIndexedAccessType":
      return name === "objectType" && parent.type === "IndexedAccessType";

    case "TypeofTypeAnnotation":
      return (
        name === "objectType" &&
        (parent.type === "IndexedAccessType" ||
          parent.type === "OptionalIndexedAccessType")
      );

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (
        typeof node.value === "string" &&
        parent.type === "ExpressionStatement" &&
        !parent.directive
      ) {
        // To avoid becoming a directive
        const grandParent = path.getParentNode(1);

        return (
          grandParent.type === "Program" ||
          grandParent.type === "BlockStatement"
        );
      }

      return (
        name === "object" &&
        parent.type === "MemberExpression" &&
        typeof node.value === "number"
      );

    case "AssignmentExpression": {
      const grandParent = path.getParentNode(1);

      if (name === "body" && parent.type === "ArrowFunctionExpression") {
        return true;
      }

      if (
        name === "key" &&
        (parent.type === "ClassProperty" ||
          parent.type === "PropertyDefinition") &&
        parent.computed
      ) {
        return false;
      }

      if (
        (name === "init" || name === "update") &&
        parent.type === "ForStatement"
      ) {
        return false;
      }

      if (parent.type === "ExpressionStatement") {
        return node.left.type === "ObjectPattern";
      }

      if (name === "key" && parent.type === "TSPropertySignature") {
        return false;
      }

      if (parent.type === "AssignmentExpression") {
        return false;
      }

      if (
        parent.type === "SequenceExpression" &&
        grandParent &&
        grandParent.type === "ForStatement" &&
        (grandParent.init === parent || grandParent.update === parent)
      ) {
        return false;
      }

      if (
        name === "value" &&
        parent.type === "Property" &&
        grandParent &&
        grandParent.type === "ObjectPattern" &&
        grandParent.properties.includes(parent)
      ) {
        return false;
      }

      if (parent.type === "NGChainedExpression") {
        return false;
      }

      return true;
    }
    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "NGPipeExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
        case "TSTypeAssertion":
        case "TypeCastExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "ConditionalExpression":
          return name === "test";

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          // Not always necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
          // Is necessary if it is `expression` of `ExpressionStatement`.
          return name === "callee";
        case "TaggedTemplateExpression":
          return true; // This is basically a kind of IIFE.
        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "PipelineTopicExpression":
          return Boolean(node.extra && node.extra.parenthesized);

        case "BinaryExpression":
          return (
            parent.operator !== "|>" || (node.extra && node.extra.parenthesized)
          );
        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "TSAsExpression":
        case "TSNonNullExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "AwaitExpression":
        case "TSTypeAssertion":
          return true;

        case "ConditionalExpression":
          return name === "test";

        default:
          return false;
      }

    case "ClassExpression":
      switch (parent.type) {
        case "NewExpression":
          return name === "callee";
        default:
          return false;
      }

    case "OptionalMemberExpression":
    case "OptionalCallExpression": {
      const parentParent = path.getParentNode(1);
      if (
        (name === "object" && parent.type === "MemberExpression") ||
        (name === "callee" &&
          (parent.type === "CallExpression" ||
            parent.type === "NewExpression")) ||
        (parent.type === "TSNonNullExpression" &&
          parentParent.type === "MemberExpression" &&
          parentParent.object === parent)
      ) {
        return true;
      }
    }
    // fallthrough
    case "CallExpression":
    case "MemberExpression":
    case "TaggedTemplateExpression":
    case "TSNonNullExpression":
      if (
        name === "callee" &&
        (parent.type === "BindExpression" || parent.type === "NewExpression")
      ) {
        let object = node;
        while (object) {
          switch (object.type) {
            case "CallExpression":
            case "OptionalCallExpression":
              return true;
            case "MemberExpression":
            case "OptionalMemberExpression":
            case "BindExpression":
              object = object.object;
              break;
            // tagged templates are basically member expressions from a grammar perspective
            // see https://tc39.github.io/ecma262/#prod-MemberExpression
            case "TaggedTemplateExpression":
              object = object.tag;
              break;
            case "TSNonNullExpression":
              object = object.expression;
              break;
            default:
              return false;
          }
        }
      }
      return false;

    case "BindExpression":
      return (
        (name === "callee" &&
          (parent.type === "BindExpression" ||
            parent.type === "NewExpression")) ||
        (name === "object" && isMemberExpression(parent))
      );
    case "NGPipeExpression":
      if (
        parent.type === "NGRoot" ||
        parent.type === "NGMicrosyntaxExpression" ||
        (parent.type === "ObjectProperty" &&
          // Preserve parens for compatibility with AngularJS expressions
          !(node.extra && node.extra.parenthesized)) ||
        parent.type === "ArrayExpression" ||
        (isCallExpression(parent) && parent.arguments[name] === node) ||
        (name === "right" && parent.type === "NGPipeExpression") ||
        (name === "property" && parent.type === "MemberExpression") ||
        parent.type === "AssignmentExpression"
      ) {
        return false;
      }
      return true;
    case "JSXFragment":
    case "JSXElement":
      return (
        name === "callee" ||
        (name === "left" &&
          parent.type === "BinaryExpression" &&
          parent.operator === "<") ||
        (parent.type !== "ArrayExpression" &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "AssignmentExpression" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "BinaryExpression" &&
          parent.type !== "NewExpression" &&
          parent.type !== "ConditionalExpression" &&
          parent.type !== "ExpressionStatement" &&
          parent.type !== "JsExpressionRoot" &&
          parent.type !== "JSXAttribute" &&
          parent.type !== "JSXElement" &&
          parent.type !== "JSXExpressionContainer" &&
          parent.type !== "JSXFragment" &&
          parent.type !== "LogicalExpression" &&
          !isCallExpression(parent) &&
          !isObjectProperty(parent) &&
          parent.type !== "ReturnStatement" &&
          parent.type !== "ThrowStatement" &&
          parent.type !== "TypeCastExpression" &&
          parent.type !== "VariableDeclarator" &&
          parent.type !== "YieldExpression")
      );
    case "TypeAnnotation":
      return (
        name === "returnType" &&
        parent.type === "ArrowFunctionExpression" &&
        includesFunctionTypeInObjectType(node)
      );
  }

  return false;
}

function isStatement(node) {
  return (
    node.type === "BlockStatement" ||
    node.type === "BreakStatement" ||
    node.type === "ClassBody" ||
    node.type === "ClassDeclaration" ||
    node.type === "ClassMethod" ||
    node.type === "ClassProperty" ||
    node.type === "PropertyDefinition" ||
    node.type === "ClassPrivateProperty" ||
    node.type === "ContinueStatement" ||
    node.type === "DebuggerStatement" ||
    node.type === "DeclareClass" ||
    node.type === "DeclareExportAllDeclaration" ||
    node.type === "DeclareExportDeclaration" ||
    node.type === "DeclareFunction" ||
    node.type === "DeclareInterface" ||
    node.type === "DeclareModule" ||
    node.type === "DeclareModuleExports" ||
    node.type === "DeclareVariable" ||
    node.type === "DoWhileStatement" ||
    node.type === "EnumDeclaration" ||
    node.type === "ExportAllDeclaration" ||
    node.type === "ExportDefaultDeclaration" ||
    node.type === "ExportNamedDeclaration" ||
    node.type === "ExpressionStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "ForStatement" ||
    node.type === "FunctionDeclaration" ||
    node.type === "IfStatement" ||
    node.type === "ImportDeclaration" ||
    node.type === "InterfaceDeclaration" ||
    node.type === "LabeledStatement" ||
    node.type === "MethodDefinition" ||
    node.type === "ReturnStatement" ||
    node.type === "SwitchStatement" ||
    node.type === "ThrowStatement" ||
    node.type === "TryStatement" ||
    node.type === "TSDeclareFunction" ||
    node.type === "TSEnumDeclaration" ||
    node.type === "TSImportEqualsDeclaration" ||
    node.type === "TSInterfaceDeclaration" ||
    node.type === "TSModuleDeclaration" ||
    node.type === "TSNamespaceExportDeclaration" ||
    node.type === "TypeAlias" ||
    node.type === "VariableDeclaration" ||
    node.type === "WhileStatement" ||
    node.type === "WithStatement"
  );
}

function isPathInForStatementInitializer(path) {
  let i = 0;
  let node = path.getValue();
  while (node) {
    const parent = path.getParentNode(i++);
    if (parent && parent.type === "ForStatement" && parent.init === node) {
      return true;
    }
    node = parent;
  }

  return false;
}

function includesFunctionTypeInObjectType(node) {
  return hasNode(
    node,
    (n1) =>
      (n1.type === "ObjectTypeAnnotation" &&
        hasNode(
          n1,
          (n2) => n2.type === "FunctionTypeAnnotation" || undefined
        )) ||
      undefined
  );
}

function endsWithRightBracket(node) {
  switch (node.type) {
    case "ObjectExpression":
      return true;
    default:
      return false;
  }
}

function isFollowedByRightBracket(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const name = path.getName();
  switch (parent.type) {
    case "NGPipeExpression":
      if (
        typeof name === "number" &&
        parent.arguments[name] === node &&
        parent.arguments.length - 1 === name
      ) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ObjectProperty":
      if (name === "value") {
        const parentParent = path.getParentNode(1);
        return getLast(parentParent.properties) === parent;
      }
      break;
    case "BinaryExpression":
    case "LogicalExpression":
      if (name === "right") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ConditionalExpression":
      if (name === "alternate") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "UnaryExpression":
      if (parent.prefix) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
  }
  return false;
}

function shouldWrapFunctionForExportDefault(path, options) {
  const node = path.getValue();
  const parent = path.getParentNode();

  if (node.type === "FunctionExpression" || node.type === "ClassExpression") {
    return (
      parent.type === "ExportDefaultDeclaration" ||
      // in some cases the function is already wrapped
      // (e.g. `export default (function() {})();`)
      // in this case we don't need to add extra parens
      !needsParens(path, options)
    );
  }

  if (
    !hasNakedLeftSide(node) ||
    (parent.type !== "ExportDefaultDeclaration" && needsParens(path, options))
  ) {
    return false;
  }

  return path.call(
    (childPath) => shouldWrapFunctionForExportDefault(childPath, options),
    ...getLeftSidePathName(path, node)
  );
}

module.exports = needsParens;
