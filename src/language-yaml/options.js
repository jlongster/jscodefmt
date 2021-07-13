"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_YAML = "YAML";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
module.exports = {
  bracketSpacing: commonOptions.bracketSpacing,
  singleQuote: commonOptions.singleQuote,
  proseWrap: commonOptions.proseWrap,
  commentSpacesFromContent: {
    since: "2.4.0",
    category: CATEGORY_YAML,
    type: "int",
    default: 1,
    description: "Amount of spaces between content and inline comments",
  },
};
