"use strict";

const prettier = require("prettier/local");
const fooPlugin = require("../plugins/defaultOptions/plugin");

test("yaml parser should handle CRLF correctly", () => {
  const input = "a:\r\n  123\r\n";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(prettier.format(input, { parser: "yaml" }))
  ).toMatchSnapshot();
});

test("typescript parser should throw the first error when both JSX and non-JSX mode failed", () => {
  const input = `
import React from "react";

const App = () => (
  <div className="App">
  </div>
);

label:
  `;
  expect(() =>
    prettier.format(input, { parser: "typescript" })
  ).toThrowErrorMatchingSnapshot();
});

test("html parser should handle CRLF correctly", () => {
  const input = "<!--\r\n  test\r\n  test\r\n-->";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(prettier.format(input, { parser: "html" }))
  ).toMatchSnapshot();
});

test("markdown parser should handle CRLF correctly", () => {
  const input = "```\r\n\r\n\r\n```";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(prettier.format(input, { parser: "markdown" }))
  ).toMatchSnapshot();
});

test("should work with foo plugin instance", () => {
  const input = "a:\r\n  123\r\n";
  expect(
    JSON.stringify(
      prettier.format(input, { parser: "foo-parser", plugins: [fooPlugin] })
    )
  ).toMatchInlineSnapshot(
    `"\\"{\\\\\\"tabWidth\\\\\\":8,\\\\\\"bracketSpacing\\\\\\":false}\\""`
  );
});
