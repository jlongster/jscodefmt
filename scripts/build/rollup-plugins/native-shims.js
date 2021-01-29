"use strict";

const fs = require("fs");
const path = require("path");
const builtins = require("builtin-modules");

const EMPTY = "export default {};";
const PREFIX = "\0shim:";

module.exports = function (dir) {
  return {
    resolveId(importee) {
      if (importee.startsWith(PREFIX)) {
        return importee;
      }

      if (/\0/.test(importee) || !builtins.includes(importee)) {
        return null;
      }

      const shim = path.resolve(dir, `${importee}.mjs`);
      if (fs.existsSync(shim)) {
        return shim;
      }
      return PREFIX + importee;
    },

    load(id) {
      if (id.startsWith(PREFIX)) {
        return EMPTY;
      }
    },
  };
};
