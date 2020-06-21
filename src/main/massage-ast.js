"use strict";

function massageAST(ast, options, parent) {
  if (Array.isArray(ast)) {
    return ast.map((e) => massageAST(e, options, parent)).filter(Boolean);
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  const newObj = {};
  for (const key of Object.keys(ast)) {
    if (typeof ast[key] !== "function") {
      newObj[key] = massageAST(ast[key], options, ast);
    }
  }

  if (options.printer.massageAstNode) {
    const result = options.printer.massageAstNode(ast, newObj, parent);
    if (result === null) {
      return;
    }
    if (result) {
      return result;
    }
  }

  return newObj;
}

module.exports = massageAST;
