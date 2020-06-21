"use strict";

module.exports = function () {
  return {
    name: "evaluate",

    transform(_text, id) {
      if (!/\.evaluate\.js$/.test(id)) {
        return null;
      }

      const json = JSON.stringify(
        require(id.replace(/^\0commonjs-proxy:/, "")),
        (_, v) => {
          if (typeof v === "function") {
            throw new Error("Cannot evaluate functions.");
          }
          return v;
        }
      );

      return {
        code: `var json = ${json}; export default json;`,
        map: { mappings: "" },
      };
    },
  };
};
