"use strict";

const runPrettier = require("../runPrettier");

describe("format correctly if stdin content compatible with stdin-filepath", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "abc.css"],
    { input: ".name { display: none; }" } // css
  ).test({
    status: 0,
  });
});

describe("throw error if stdin content incompatible with stdin-filepath", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "abc.js"],
    { input: ".name { display: none; }" } // css
  ).test({
    status: "non-zero",
  });
});

describe("gracefully handle stdin-filepath with nonexistent directory", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "definitely/nonexistent/path.css"],
    { input: ".name { display: none; }" } // css
  ).test({
    status: 0,
  });
});

describe("apply editorconfig for stdin-filepath with nonexistent file", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "config/editorconfig/nonexistent.js"],
    {
      input: `
function f() {
  console.log("should be indented with a tab");
}
`.trim(), // js
    }
  ).test({
    status: 0,
  });
});

describe("apply editorconfig for stdin-filepath with nonexistent directory", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "config/editorconfig/nonexistent/one/two/three.js"],
    {
      input: `
function f() {
  console.log("should be indented with a tab");
}
`.trim(), // js
    }
  ).test({
    status: 0,
  });
});

describe("don’t apply editorconfig outside project for stdin-filepath with nonexistent directory", () => {
  runPrettier(
    "cli",
    [
      "--stdin-filepath",
      "config/editorconfig/repo-root/nonexistent/one/two/three.js",
    ],
    {
      input: `
function f() {
  console.log("should be indented with 2 spaces");
}
`.trim(), // js
    }
  ).test({
    status: 0,
  });
});

describe("output file as-is if stdin-filepath matched patterns in ignore-path", () => {
  runPrettier("cli/stdin-ignore", ["--stdin-filepath", "ignore/example.js"], {
    input: "hello_world( );",
  }).test({
    stdout: "hello_world( );",
    status: 0,
  });
});
