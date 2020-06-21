"use strict";

module.exports = function (text, parsers) {
  const ast = parsers.babel(text);
  ast.program.body[0].expression.callee.name = "bar";
  return ast;
};
