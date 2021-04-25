"use strict";

const { getNextNonSpaceNonCommentCharacter } = require("../../common/util");
const { printDanglingComments } = require("../../main/comments");
const {
  builders: { line, hardline, softline, group, indent, ifBreak },
  utils: { removeLines, willBreak },
} = require("../../document");
const {
  getFunctionParameters,
  iterateFunctionParametersPath,
  isSimpleType,
  isTestCall,
  isTypeAnnotationAFunction,
  isObjectType,
  isObjectTypePropertyAFunction,
  hasRestParameter,
  shouldPrintComma,
  hasComment,
  isNextLineEmpty,
} = require("../utils");
const { locEnd } = require("../loc");
const { ArgExpansionBailout } = require("../../common/errors");
const { printFunctionTypeParameters } = require("./misc");

/** @typedef {import("../../common/ast-path")} AstPath */

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
    return [
      typeParams,
      "(",
      printDanglingComments(
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
    ];
  }

  const parent = path.getParentNode();
  const isParametersInTestCall = isTestCall(parent);
  const shouldHugParameters = shouldHugFunctionParameters(functionNode);
  const printed = [];
  iterateFunctionParametersPath(path, (parameterPath, index) => {
    const isLastParameter = index === parameters.length - 1;
    if (isLastParameter && functionNode.rest) {
      printed.push("...");
    }
    printed.push(print());
    if (isLastParameter) {
      return;
    }
    printed.push(",");
    if (isParametersInTestCall || shouldHugParameters) {
      printed.push(" ");
    } else if (isNextLineEmpty(parameters[index], options)) {
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
  //   )                     ) => {
  //                         })
  if (expandArg && !isDecoratedFunction(path)) {
    if (willBreak(typeParams) || willBreak(printed)) {
      // Removing lines in this case leads to broken or ugly output
      throw new ArgExpansionBailout();
    }
    return group([removeLines(typeParams), "(", removeLines(printed), ")"]);
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
    return [typeParams, "(", ...printed, ")"];
  }

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isParametersInTestCall) {
    return [typeParams, "(", ...printed, ")"];
  }

  const isFlowShorthandWithOneArg =
    (isObjectTypePropertyAFunction(parent) ||
      isTypeAnnotationAFunction(parent) ||
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
      return ["(", ...printed, ")"];
    }
    return printed;
  }

  return [
    typeParams,
    "(",
    indent([softline, ...printed]),
    ifBreak(
      !hasRestParameter(functionNode) && shouldPrintComma(options, "all")
        ? ","
        : ""
    ),
    softline,
    ")",
  ];
}

function shouldHugFunctionParameters(node) {
  if (!node) {
    return false;
  }
  const parameters = getFunctionParameters(node);
  if (parameters.length !== 1) {
    return false;
  }
  const [parameter] = parameters;
  return (
    !hasComment(parameter) &&
    (parameter.type === "ObjectPattern" ||
      parameter.type === "ArrayPattern" ||
      (parameter.type === "Identifier" &&
        parameter.typeAnnotation &&
        (parameter.typeAnnotation.type === "TypeAnnotation" ||
          parameter.typeAnnotation.type === "TSTypeAnnotation") &&
        isObjectType(parameter.typeAnnotation.typeAnnotation)) ||
      (parameter.type === "FunctionTypeParam" &&
        isObjectType(parameter.typeAnnotation)) ||
      (parameter.type === "AssignmentPattern" &&
        (parameter.left.type === "ObjectPattern" ||
          parameter.left.type === "ArrayPattern") &&
        (parameter.right.type === "Identifier" ||
          (parameter.right.type === "ObjectExpression" &&
            parameter.right.properties.length === 0) ||
          (parameter.right.type === "ArrayExpression" &&
            parameter.right.elements.length === 0))))
  );
}

function getReturnTypeNode(functionNode) {
  let returnTypeNode;
  if (functionNode.returnType) {
    returnTypeNode = functionNode.returnType;
    if (returnTypeNode.typeAnnotation) {
      returnTypeNode = returnTypeNode.typeAnnotation;
    }
  } else if (functionNode.typeAnnotation) {
    returnTypeNode = functionNode.typeAnnotation;
  }
  return returnTypeNode;
}

// When parameters are grouped, the return type annotation breaks first.
function shouldGroupFunctionParameters(functionNode, returnTypeDoc) {
  const returnTypeNode = getReturnTypeNode(functionNode);
  if (!returnTypeNode) {
    return false;
  }

  const typeParameters =
    functionNode.typeParameters && functionNode.typeParameters.params;
  if (typeParameters) {
    if (typeParameters.length > 1) {
      return false;
    }
    if (typeParameters.length === 1) {
      const typeParameter = typeParameters[0];
      if (typeParameter.constraint || typeParameter.default) {
        return false;
      }
    }
  }

  return (
    getFunctionParameters(functionNode).length === 1 &&
    (isObjectType(returnTypeNode) || willBreak(returnTypeDoc))
  );
}

/**
 * The "decorated function" pattern.
 * The arrow function should be kept hugged even if its signature breaks.
 *
 * ```
 * const decoratedFn = decorator(param1, param2)((
 *   ...
 * ) => {
 *   ...
 * });
 * ```
 * @param {AstPath} path
 */
function isDecoratedFunction(path) {
  return path.match(
    (node) =>
      node.type === "ArrowFunctionExpression" &&
      node.body.type === "BlockStatement",
    (node, name) => {
      if (
        node.type === "CallExpression" &&
        name === "arguments" &&
        node.arguments.length === 1 &&
        node.callee.type === "CallExpression"
      ) {
        const decorator = node.callee.callee;
        return (
          decorator.type === "Identifier" ||
          (decorator.type === "MemberExpression" &&
            !decorator.computed &&
            decorator.object.type === "Identifier" &&
            decorator.property.type === "Identifier")
        );
      }
      return false;
    },
    (node, name) =>
      (node.type === "VariableDeclarator" && name === "init") ||
      (node.type === "ExportDefaultDeclaration" && name === "declaration"),
    (node) =>
      node.type !== "VariableDeclaration" ||
      (node.kind === "const" && node.declarations.length === 1)
  );
}

module.exports = {
  printFunctionParameters,
  shouldHugFunctionParameters,
  shouldGroupFunctionParameters,
};
