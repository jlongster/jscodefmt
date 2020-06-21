"use strict";

const sharedUtil = require("../../src/common/util-shared");

test("shared util has correct structure", () => {
  expect(typeof sharedUtil.getMaxContinuousCount).toEqual("function");
  expect(typeof sharedUtil.getStringWidth).toEqual("function");
  expect(typeof sharedUtil.getAlignmentSize).toEqual("function");
  expect(typeof sharedUtil.getIndentSize).toEqual("function");
  expect(typeof sharedUtil.skip).toEqual("function");
  expect(typeof sharedUtil.skipWhitespace).toEqual("function");
  expect(typeof sharedUtil.skipSpaces).toEqual("function");
  expect(typeof sharedUtil.skipToLineEnd).toEqual("function");
  expect(typeof sharedUtil.skipEverythingButNewLine).toEqual("function");
  expect(typeof sharedUtil.skipInlineComment).toEqual("function");
  expect(typeof sharedUtil.skipTrailingComment).toEqual("function");
  expect(typeof sharedUtil.skipNewline).toEqual("function");
  expect(typeof sharedUtil.hasNewline).toEqual("function");
  expect(typeof sharedUtil.hasNewlineInRange).toEqual("function");
  expect(typeof sharedUtil.hasSpaces).toEqual("function");
  expect(typeof sharedUtil.isNextLineEmpty).toEqual("function");
  expect(typeof sharedUtil.isNextLineEmptyAfterIndex).toEqual("function");
  expect(typeof sharedUtil.isPreviousLineEmpty).toEqual("function");
  expect(typeof sharedUtil.getNextNonSpaceNonCommentCharacterIndex).toEqual(
    "function"
  );
  expect(typeof sharedUtil.makeString).toEqual("function");
});

test("sharedUtil.getMaxContinuousCount", () => {
  const { getMaxContinuousCount } = sharedUtil;

  expect(getMaxContinuousCount("|---|--|-|--|---|", "-")).toEqual(3);
  expect(getMaxContinuousCount("|...|", ".")).toEqual(3);

  const fixture = [
    "([a-f])([a-f])",
    "[a-f][a-f][a-f]",
    "a-fa-fa-fa-f",
    "bbbbbbbbbbbbbbbbbb", // neither `a-f` `[a-f]` `([a-f])` should matches `b`
  ].join("");
  expect(getMaxContinuousCount(fixture, "([a-f])")).toEqual(2);
  expect(getMaxContinuousCount(fixture, "[a-f]")).toEqual(3);
  expect(getMaxContinuousCount(fixture, "a-f")).toEqual(4);
  expect(getMaxContinuousCount(fixture, "([a\\-f])")).toEqual(0);
  expect(getMaxContinuousCount(fixture, "[a\\-f]")).toEqual(0);
  expect(getMaxContinuousCount(fixture, "a\\-f")).toEqual(0);
});

test("sharedUtil.getStringWidth", () => {
  const { getStringWidth } = sharedUtil;

  // From https://github.com/sindresorhus/string-width/blob/master/test.js
  expect(getStringWidth("abcde")).toBe(5);
  expect(getStringWidth("古池や")).toBe(6);
  expect(getStringWidth("あいうabc")).toBe(9);
  expect(getStringWidth("ノード.js")).toBe(9);
  expect(getStringWidth("你好")).toBe(4);
  expect(getStringWidth("안녕하세요")).toBe(10);
  expect(getStringWidth("A\uD83C\uDE00BC")).toBe(5);
  expect(getStringWidth("\u001B[31m\u001B[39m")).toBe(0);
  expect(
    getStringWidth("\u001B]8;;https://github.com\u0007Click\u001B]8;;\u0007")
  ).toBe(5);
  expect(getStringWidth("\u{231A}")).toBe(2);
  expect(getStringWidth("\u{2194}\u{FE0F}")).toBe(2);
  expect(getStringWidth("\u{1F469}")).toBe(2);
  expect(getStringWidth("\u{1F469}\u{1F3FF}")).toBe(2);
  expect(getStringWidth(String.fromCharCode(0))).toBe(0);
  expect(getStringWidth(String.fromCharCode(31))).toBe(0);
  // expect(getStringWidth(String.fromCharCode(127))).toBe(0); // Different with `string-width`
  expect(getStringWidth(String.fromCharCode(134))).toBe(0);
  expect(getStringWidth(String.fromCharCode(159))).toBe(0);
  expect(getStringWidth("\u001B")).toBe(0);
  // expect(getStringWidth("x\u0300"), 1); // Different with `string-width`
});

test("sharedUtil.getAlignmentSize", () => {
  const { getAlignmentSize } = sharedUtil;
  expect(getAlignmentSize("   ")).toBe(3);
  expect(getAlignmentSize("   ", /* tabWidth */ 2, /* startIndex */ 2)).toBe(1);
  expect(getAlignmentSize("\t\t", /* tabWidth */ 2)).toBe(4);
  expect(getAlignmentSize("\t\t", /* tabWidth */ 3)).toBe(6);
  expect(getAlignmentSize("\t\t", /* tabWidth */ 3, /* startIndex */ 1)).toBe(
    3
  );
});

test("sharedUtil.getIndentSize", () => {
  const { getIndentSize } = sharedUtil;
  expect(getIndentSize("\n   a")).toBe(3);
  expect(getIndentSize("\n   a", /* tabWidth */ 2)).toBe(3);
  expect(getIndentSize("\n\t\ta", /* tabWidth */ 2)).toBe(4);
  expect(getIndentSize("\n\t\ta", /* tabWidth */ 3)).toBe(6);
  expect(getIndentSize("\n\t\n\t\t", /* tabWidth */ 2)).toBe(4);
  expect(getIndentSize("\n \n  ", /* tabWidth */ 2)).toBe(2);
  expect(getIndentSize("   \n\t\t\n", /* tabWidth */ 2)).toBe(0);
});

test("sharedUtil.makeString", () => {
  const { makeString } = sharedUtil;
  const DOUBLE_QUOTE = '"';
  const SINGLE_QUOTE = "'";

  expect(makeString("a", DOUBLE_QUOTE)).toBe(`${DOUBLE_QUOTE}a${DOUBLE_QUOTE}`);
  expect(makeString("a", SINGLE_QUOTE)).toBe(`${SINGLE_QUOTE}a${SINGLE_QUOTE}`);
  expect(makeString(`a${DOUBLE_QUOTE}`, DOUBLE_QUOTE)).toBe(
    `${DOUBLE_QUOTE}a\\${DOUBLE_QUOTE}${DOUBLE_QUOTE}`
  );
  expect(makeString(`a${DOUBLE_QUOTE}`, SINGLE_QUOTE)).toBe(
    `${SINGLE_QUOTE}a${DOUBLE_QUOTE}${SINGLE_QUOTE}`
  );
  expect(
    makeString("\\a", SINGLE_QUOTE, /* unescapeUnnecessaryEscapes */ true)
  ).toBe(`${SINGLE_QUOTE}a${SINGLE_QUOTE}`);
});
