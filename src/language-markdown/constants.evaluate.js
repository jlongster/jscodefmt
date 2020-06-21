"use strict";

const cjkRegex = require("cjk-regex");
const regexpUtil = require("regexp-util");
const unicodeRegex = require("unicode-regex");

const cjkPattern = `(?:${cjkRegex()
  .union(
    unicodeRegex({
      Script_Extensions: ["Han", "Katakana", "Hiragana", "Hangul", "Bopomofo"],
      General_Category: [
        "Other_Letter",
        "Letter_Number",
        "Other_Symbol",
        "Modifier_Letter",
        "Modifier_Symbol",
        "Nonspacing_Mark",
      ],
    })
  )
  .toString()})(?:${unicodeRegex({
  Block: ["Variation_Selectors", "Variation_Selectors_Supplement"],
}).toString()})?`;

const kPattern = unicodeRegex({ Script: ["Hangul"] })
  .union(unicodeRegex({ Script_Extensions: ["Hangul"] }))
  .toString();

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationCharset = /* prettier-ignore */ regexpUtil.charset(
  "!", '"', "#",  "$", "%", "&", "'", "(", ")", "*",
  "+", ",", "-",  ".", "/", ":", ";", "<", "=", ">",
  "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|",
  "}", "~"
);

// http://spec.commonmark.org/0.25/#punctuation-character
const punctuationCharset = unicodeRegex({
  // http://unicode.org/Public/5.1.0/ucd/UCD.html#General_Category_Values
  General_Category: [
    /* Pc */ "Connector_Punctuation",
    /* Pd */ "Dash_Punctuation",
    /* Pe */ "Close_Punctuation",
    /* Pf */ "Final_Punctuation",
    /* Pi */ "Initial_Punctuation",
    /* Po */ "Other_Punctuation",
    /* Ps */ "Open_Punctuation",
  ],
}).union(asciiPunctuationCharset);

const punctuationPattern = punctuationCharset.toString();

module.exports = {
  cjkPattern,
  kPattern,
  punctuationPattern,
};
