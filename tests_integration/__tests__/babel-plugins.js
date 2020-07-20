"use strict";
const { babelParsers } = require("../env");
const fs = require("fs");
const path = require("path");

for (const parser of ["babel", "babel-flow", "babel-ts", "json"]) {
  describe(parser, () => {
    const { parse } = babelParsers[parser];
    const dir = path.join(__dirname, "../../tests/js/babel-plugins/");

    const fixtures = fs
      .readdirSync(dir)
      .filter((file) => file !== "jsfmt.spec.js" && file !== "__snapshots__")
      .map((file) => ({
        file,
        code: fs.readFileSync(path.join(dir, file), "utf8"),
      }));

    for (const { file, code } of fixtures) {
      test(file, () => {
        expect({
          input: code,
          plugins: JSON.stringify(
            parse(code, [], { __testBabelPluginCombinations: true }),
            null,
            2
          ),
        }).toMatchSnapshot();
      });
    }
  });
}
