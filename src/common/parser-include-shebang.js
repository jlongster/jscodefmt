"use strict";

const { getShebang } = require("./util");

function includeShebang(text, ast) {
  const shebang = getShebang(text);

  if (!shebang) {
    return;
  }
  const index = shebang.length;

  const comment = {
    type: "Line",
    value: shebang.slice(2),
    range: [0, index],
    loc: {
      start: {
        line: 1,
        column: 0,
      },
      end: {
        line: 1,
        column: index,
      },
    },
  };

  ast.comments = [comment].concat(ast.comments);
}

module.exports = includeShebang;
