"use strict";

const prettier = require("prettier/local");
const { concat } = prettier.doc.builders;

module.exports = {
  languages: [
    {
      name: "bar",
      parsers: ["bar"]
    }
  ],
  parsers: {
    bar: {
      parse: text => ({ text }),
      astFormat: "bar"
    }
  },
  printers: {
    bar: {
      print: path =>
        concat([
          "content from `prettier-plugin-bar.js` file + ",
          path.getValue().text
        ])
    }
  },
  defaultOptions: {
    tabWidth: 4
  }
};
