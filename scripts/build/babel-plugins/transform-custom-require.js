"use strict";

//
// BEFORE:
//   eval("require")("./path/to/file")
//   eval("require")(identifier)
//   eval("require").cache
//
// AFTER:
//   require("./file")
//   require(identifier)
//   require.cache
//

module.exports = function (babel) {
  const t = babel.types;

  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        if (isEvalRequire(node.callee) && node.arguments.length === 1) {
          let arg = node.arguments[0];
          if (t.isLiteral(arg) && arg.value.startsWith(".")) {
            const value = "." + arg.value.slice(arg.value.lastIndexOf("/"));
            arg = t.stringLiteral(value);
          }
          path.replaceWith(t.callExpression(t.identifier("require"), [arg]));
        }
      },
      MemberExpression(path) {
        const { node } = path;
        if (isEvalRequire(node.object)) {
          path.replaceWith(
            t.memberExpression(
              t.identifier("require"),
              node.property,
              node.compute,
              node.optional
            )
          );
        }
      },
    },
  };

  function isEvalRequire(node) {
    return (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee, { name: "eval" }) &&
      node.arguments.length === 1 &&
      t.isLiteral(node.arguments[0], { value: "require" })
    );
  }
};
