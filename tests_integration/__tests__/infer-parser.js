"use strict";

const runPrettier = require("../runPrettier");
const prettier = require("prettier/local");

describe("stdin no path and no parser", () => {
  describe("logs error and exits with 2", () => {
    runPrettier("cli/infer-parser/", [], { input: "foo" }).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("--check logs error but exits with 0", () => {
    runPrettier("cli/infer-parser/", ["--check"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("--list-different logs error but exits with 0", () => {
    runPrettier("cli/infer-parser/", ["--list-different"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });
});

describe("stdin with unknown path and no parser", () => {
  describe("logs error and exits with 2", () => {
    runPrettier("cli/infer-parser/", ["--stdin-filepath", "foo"], {
      input: "foo",
    }).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("--check logs error but exits with 0", () => {
    runPrettier("cli/infer-parser/", ["--check", "--stdin-filepath", "foo"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("--list-different logs error but exits with 0", () => {
    runPrettier(
      "cli/infer-parser/",
      ["--list-different", "--stdin-filepath", "foo"],
      { input: "foo" }
    ).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });
});

describe("unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", ["--end-of-line", "lf", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", ["--end-of-line", "lf", "*"]).test({
      status: 2,
      write: [],
    });
  });
});

describe("--check with unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", ["--check", "FOO"]).test({
      status: 0,
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", ["--check", "*"]).test({
      status: 1,
      write: [],
    });
  });
});

describe("--list-different with unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", ["--list-different", "FOO"]).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", ["--list-different", "*"]).test({
      status: 1,
      stdout: "foo.js\n",
      write: [],
    });
  });
});

describe("--write with unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", ["--write", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", ["--write", "*"]).test({
      status: 2,
    });
  });
});

describe("--write and --check with unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", ["--check", "--write", "FOO"]).test({
      status: 0,
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", ["--check", "--write", "*"]).test({
      status: 0,
    });
  });
});

describe("--write and --list-different with unknown path and no parser", () => {
  describe("specific file", () => {
    runPrettier("cli/infer-parser/", [
      "--list-different",
      "--write",
      "FOO",
    ]).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runPrettier("cli/infer-parser/", [
      "--list-different",
      "--write",
      "*",
    ]).test({ status: 0 });
  });
});

describe("API with no path and no parser", () => {
  const _console = global.console;

  beforeEach(() => {
    global.console = { warn: jest.fn() };
  });

  afterEach(() => {
    global.console = _console;
  });

  test("prettier.format", () => {
    expect(prettier.format(" foo  (  )")).toEqual("foo();\n");
    expect(global.console.warn).toHaveBeenCalledTimes(1);
    expect(global.console.warn.mock.calls[0]).toMatchSnapshot();
  });

  test("prettier.check", () => {
    expect(prettier.check(" foo (  )")).toBe(false);
    expect(global.console.warn).toHaveBeenCalledTimes(1);
    expect(global.console.warn.mock.calls[0]).toMatchSnapshot();
  });
});
