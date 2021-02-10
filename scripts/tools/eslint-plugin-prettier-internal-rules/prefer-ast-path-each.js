"use strict";

const selector = [
  "ExpressionStatement",
  ">",
  "CallExpression.expression",
  "[optional=false]",
  ">",
  "MemberExpression.callee",
  "[computed=false]",
  "[optional=false]",
  ">",
  "Identifier.property",
  '[name="map"]',
].join("");

const messageId = "prefer-ast-path-each";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/main/scripts/eslint-plugin-prettier-internal-rules/require-json-extensions.js",
    },
    messages: {
      [messageId]: "Prefer `AstPath#each()` over `AstPath#map()`.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
          fix: (fixer) => fixer.replaceText(node, "each"),
        });
      },
    };
  },
};
