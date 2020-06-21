"use strict";

const commonOptions = require("../common/common-options");

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  proseWrap: commonOptions.proseWrap,
  singleQuote: commonOptions.singleQuote,
};
