"use strict";

const parse = require("@iarna/toml/parse-string");

module.exports = function (filePath, content) {
  try {
    return parse(content);
  } catch (error) {
    error.message = `TOML Error in ${filePath}:\n${error.message}`;
    throw error;
  }
};
