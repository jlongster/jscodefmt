"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { findVariable } = require("eslint-utils");
const selector = [
  "CallExpression",
  "[optional=false]",
  '[callee.type="MemberExpression"]',
  "[callee.computed=false]",
  "[callee.optional=false]",
  // We always use `path` or `xxxPath`
  '[callee.object.type="Identifier"]',
  '[callee.property.type="Identifier"]',
  "[callee.property.name=/^(?:map|each)$/]",
  "[arguments.length>1]",
  '[arguments.0.type!="SpreadElement"]',
].join("");

const messageId = "no-ast-path-map-each";

function getValueDeclarator(pathParameter, scope) {
  let valueName = "value";
  if (!pathParameter) {
    return {};
  }

  const { references } = findVariable(scope, pathParameter);
  let pathIdentifiers = references.map(({ identifier }) => identifier);

  let valueDeclarator;
  for (const identifier of pathIdentifiers) {
    if (
      identifier.parent.type === "MemberExpression" &&
      !identifier.parent.optional &&
      !identifier.parent.computed &&
      identifier.parent.object === identifier &&
      identifier.parent.property &&
      identifier.parent.property.type === "Identifier" &&
      (identifier.parent.property.name === "getNode" ||
        identifier.parent.property.name === "getValue") &&
      identifier.parent.parent.type === "CallExpression" &&
      !identifier.parent.parent.optional &&
      identifier.parent.parent.callee === identifier.parent &&
      identifier.parent.parent.arguments.length === 0 &&
      identifier.parent.parent.parent.type === "VariableDeclarator" &&
      identifier.parent.parent.parent.init === identifier.parent.parent &&
      identifier.parent.parent.parent.id.type === "Identifier" &&
      identifier.parent.parent.parent.parent.type === "VariableDeclaration"
    ) {
      valueDeclarator = identifier.parent.parent.parent.parent;
      valueName = identifier.parent.parent.parent.id.name;
      pathIdentifiers = pathIdentifiers.filter((node) => node !== identifier);
      break;
    }
  }

  return { valueName, valueDeclarator, pathIdentifiers };
}

function replaceIdentifier(node, replacement, fixer) {
  const { parent } = node;
  if (
    parent &&
    parent.type === "Property" &&
    parent.shorthand &&
    parent.key === node
  ) {
    return fixer.insertTextAfter(node, `: ${replacement}`);
  }

  return fixer.replaceText(node, replacement);
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/main/scripts/eslint-plugin-prettier-internal-rules/no-ast-path-map-each.js",
    },
    messages: {
      [messageId]:
        "Prefer `AstPath#{{replacement}}()` over `AstPath#{{method}}()`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;

    return {
      [selector](node) {
        const {
          callee,
          arguments: [callback],
        } = node;

        const method = callee.property.name;

        // ignore `path.map(print, ...)`
        if (
          method === "map" &&
          callback.type === "Identifier" &&
          callback.name === "print"
        ) {
          return;
        }

        const replacement = `${method}Value`;

        const problem = {
          node: callee.property,
          messageId,
          data: { method, replacement },
        };

        if (
          (callback.type !== "ArrowFunctionExpression" &&
            callback.type !== "FunctionExpression") ||
          (callback.params[0] && callback.params[0].type !== "Identifier")
        ) {
          context.report(problem);
          return;
        }

        const [pathParameter] = node.arguments[0].params;
        const callbackScope = scopeManager.acquire(callback);

        const {
          valueName,
          valueDeclarator,
          pathIdentifiers,
        } = getValueDeclarator(pathParameter, callbackScope);

        problem.fix = function* (fixer) {
          yield fixer.replaceText(callee.property, replacement);

          if (!pathParameter) {
            return;
          }

          if (valueDeclarator) {
            yield fixer.remove(valueDeclarator);
          }

          yield fixer.replaceText(pathParameter, valueName);

          const pathName = callee.object.name;
          for (const identifier of pathIdentifiers) {
            yield replaceIdentifier(identifier, pathName, fixer);
          }
        };

        context.report(problem);
      },
    };
  },
};
