"use strict";

const path = require("path");

module.exports = function (modules = []) {
  const requires = modules.reduce((obj, mod) => {
    obj[mod] = path.basename(mod).replace(/\.js$/, "");
    return obj;
  }, {});

  return {
    name: "externals",

    load(importee) {
      if (requires[importee]) {
        return `module.exports = eval("require")("./${requires[importee]}");`;
      }
    },
  };
};
