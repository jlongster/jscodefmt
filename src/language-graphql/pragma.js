"use strict";

function hasPragma(text) {
  return /^\s*#[^\S\n]*@(format|prettier)\s*(\n|$)/.test(text);
}

function insertPragma(text) {
  return "# @format\n\n" + text;
}

module.exports = {
  hasPragma,
  insertPragma,
};
