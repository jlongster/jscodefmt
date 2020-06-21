"use strict";

/**
 * modified from https://github.com/mdx-js/mdx/blob/master/packages/mdx
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2018 Compositor and Zeit, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const IMPORT_REGEX = /^import\s/;
const EXPORT_REGEX = /^export\s/;
const BLOCKS_REGEX = "[a-z][a-z0-9]*(\\.[a-z][a-z0-9]*)*|";
const COMMENT_REGEX = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
const EMPTY_NEWLINE = "\n\n";

const isImport = (text) => IMPORT_REGEX.test(text);
const isExport = (text) => EXPORT_REGEX.test(text);

const tokenizeEsSyntax = (eat, value) => {
  const index = value.indexOf(EMPTY_NEWLINE);
  const subvalue = value.slice(0, index);

  if (isExport(subvalue) || isImport(subvalue)) {
    return eat(subvalue)({
      type: isExport(subvalue) ? "export" : "import",
      value: subvalue,
    });
  }
};

tokenizeEsSyntax.locator = (value /*, fromIndex*/) => {
  return isExport(value) || isImport(value) ? -1 : 1;
};

function esSyntax() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.esSyntax = tokenizeEsSyntax;

  methods.splice(methods.indexOf("paragraph"), 0, "esSyntax");
}

module.exports = {
  esSyntax,
  BLOCKS_REGEX,
  COMMENT_REGEX,
};
