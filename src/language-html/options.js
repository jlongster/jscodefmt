"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_HTML = "HTML";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
module.exports = {
  bracketSameLine: commonOptions.bracketSameLine,
  htmlWhitespaceSensitivity: {
    since: "1.15.0",
    category: CATEGORY_HTML,
    type: "choice",
    default: "css",
    description: "How to handle whitespaces in HTML.",
    choices: [
      {
        value: "css",
        description: "Respect the default value of CSS display property.",
      },
      {
        value: "strict",
        description: "Whitespaces are considered sensitive.",
      },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive.",
      },
    ],
  },
  vueIndentScriptAndStyle: {
    since: "1.19.0",
    category: CATEGORY_HTML,
    type: "boolean",
    default: false,
    description: "Indent script and style tags in Vue files.",
  },
};
