"use strict";

const { TEST_STANDALONE } = process.env;

const fs = require("fs");
const path = require("path");
const { isCI } = require("ci-info");
const prettier = !TEST_STANDALONE
  ? require("prettier/local")
  : require("prettier/standalone");
const checkParsers = require("./utils/check-parsers");
const visualizeRange = require("./utils/visualize-range");
const createSnapshot = require("./utils/create-snapshot");
const composeOptionsForSnapshot = require("./utils/compose-options-for-snapshot");
const visualizeEndOfLine = require("./utils/visualize-end-of-line");
const consistentEndOfLine = require("./utils/consistent-end-of-line");
const stringifyOptionsForTitle = require("./utils/stringify-options-for-title");

const AST_COMPARE = isCI || process.env.AST_COMPARE;
const DEEP_COMPARE = isCI || process.env.DEEP_COMPARE;
const TEST_CRLF =
  (isCI && process.platform === "win32") || process.env.TEST_CRLF;

const CURSOR_PLACEHOLDER = "<|>";
const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";

// TODO: these test files need fix
const unstableTests = new Map(
  [
    "js/class-comment/misc.js",
    ["js/comments/dangling_array.js", (options) => options.semi === false],
    ["js/comments/jsx.js", (options) => options.semi === false],
    "js/comments/return-statement.js",
    "js/comments/tagged-template-literal.js",
    "js/comments-closure-typecast/iife.js",
    "markdown/spec/example-234.md",
    "markdown/spec/example-235.md",
    "html/multiparser-js/script-tag-escaping.html",
    [
      "js/multiparser-markdown/codeblock.js",
      (options) => options.proseWrap === "always",
    ],
    ["js/no-semi/comments.js", (options) => options.semi === false],
  ].map((fixture) => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(__dirname, "../tests/", file), isUnstable];
  })
);

const isTestDirectory = (dirname, name) =>
  dirname.startsWith(path.join(__dirname, "../tests", name));

global.run_spec = (fixtures, parsers, options) => {
  fixtures = typeof fixtures === "string" ? { dirname: fixtures } : fixtures;
  const { dirname } = fixtures;

  // `IS_PARSER_INFERENCE_TESTS` mean to test `inferParser` on `standalone`
  const IS_PARSER_INFERENCE_TESTS = isTestDirectory(
    dirname,
    "misc/parser-inference"
  );

  // `IS_ERROR_TESTS` mean to watch errors like:
  // - syntax parser hasn't supported yet
  // - syntax errors that should throws
  const IS_ERROR_TESTS = isTestDirectory(dirname, "misc/errors");

  if (IS_PARSER_INFERENCE_TESTS) {
    parsers = [];
  } else if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  const snippets = (fixtures.snippets || []).map((test, index) => {
    test = typeof test === "string" ? { code: test } : test;
    return {
      ...test,
      name: `snippet: ${test.name || `#${index}`}`,
    };
  });

  const files = fs
    .readdirSync(dirname, { withFileTypes: true })
    .map((file) => {
      const basename = file.name;
      const filename = path.join(dirname, basename);
      if (
        path.extname(basename) === ".snap" ||
        !file.isFile() ||
        basename[0] === "." ||
        basename === "jsfmt.spec.js"
      ) {
        return;
      }

      const text = fs.readFileSync(filename, "utf8");

      return {
        name: basename,
        filename,
        code: text,
      };
    })
    .filter(Boolean);

  // Make sure tests are in correct location
  // only runs on local and one task on CI
  if (!isCI || process.env.ENABLE_CODE_COVERAGE) {
    checkParsers({ dirname, files }, parsers);
  }

  const stringifiedOptions = stringifyOptionsForTitle(options);

  for (const { name, filename, code, output } of [...files, ...snippets]) {
    describe(`${name}${
      stringifiedOptions ? ` - ${stringifiedOptions}` : ""
    }`, () => {
      let rangeStart;
      let rangeEnd;
      let cursorOffset;

      const source = (TEST_CRLF ? code.replace(/\n/g, "\r\n") : code)
        .replace(RANGE_START_PLACEHOLDER, (match, offset) => {
          rangeStart = offset;
          return "";
        })
        .replace(RANGE_END_PLACEHOLDER, (match, offset) => {
          rangeEnd = offset;
          return "";
        });

      const input = source.replace(CURSOR_PLACEHOLDER, (match, offset) => {
        cursorOffset = offset;
        return "";
      });

      const baseOptions = {
        printWidth: 80,
        ...options,
        rangeStart,
        rangeEnd,
        cursorOffset,
      };
      const mainOptions = {
        ...baseOptions,
        ...(IS_PARSER_INFERENCE_TESTS
          ? { filepath: filename }
          : { parser: parsers[0] }),
      };

      const hasEndOfLine = "endOfLine" in mainOptions;

      if (IS_ERROR_TESTS) {
        test("error test", () => {
          expect(() => {
            format(input, filename, mainOptions);
          }).toThrowErrorMatchingSnapshot();
        });
        return;
      }

      const formattedWithCursor = format(input, filename, mainOptions);
      const formatted = formattedWithCursor.replace(CURSOR_PLACEHOLDER, "");
      const visualizedOutput = visualizeEndOfLine(formattedWithCursor);

      test("format", () => {
        expect(visualizedOutput).toEqual(
          visualizeEndOfLine(consistentEndOfLine(formattedWithCursor))
        );
        if (typeof output === "string") {
          expect(formatted).toEqual(output);
        } else {
          let codeForSnapshot = hasEndOfLine
            ? code
                .replace(RANGE_START_PLACEHOLDER, "")
                .replace(RANGE_END_PLACEHOLDER, "")
            : source;
          let codeOffset = 0;

          if (
            typeof baseOptions.rangeStart === "number" ||
            typeof baseOptions.rangeEnd === "number"
          ) {
            codeForSnapshot = visualizeRange(codeForSnapshot, baseOptions);
            codeOffset = codeForSnapshot.match(/^>?\s+1 \| /)[0].length;
          }

          if (hasEndOfLine) {
            codeForSnapshot = visualizeEndOfLine(codeForSnapshot);
          }

          expect(
            createSnapshot(
              codeForSnapshot,
              hasEndOfLine ? visualizedOutput : formattedWithCursor,
              composeOptionsForSnapshot(baseOptions, parsers),
              { codeOffset }
            )
          ).toMatchSnapshot();
        }
      });

      if (parsers.includes("babel")) {
        test("async format", async () => {
          const asyncResult = await format(input, filename, {
            ...mainOptions,
            parser: "async-babel",
          });
          expect(asyncResult).toEqual(formattedWithCursor);
        });
      }

      const parsersToVerify = parsers.slice(1);
      if (parsers.includes("typescript") && !parsers.includes("babel-ts")) {
        parsersToVerify.push("babel-ts");
      }

      for (const parser of parsersToVerify) {
        const verifyOptions = { ...baseOptions, parser };

        test(`verify (${parser})`, () => {
          if (
            parser === "babel-ts" &&
            options &&
            (options.disableBabelTS === true ||
              (Array.isArray(options.disableBabelTS) &&
                options.disableBabelTS.includes(name)))
          ) {
            expect(() => {
              format(input, filename, verifyOptions);
            }).toThrow(TEST_STANDALONE ? undefined : SyntaxError);
          } else {
            const verifyOutput = format(input, filename, verifyOptions);
            expect(visualizeEndOfLine(verifyOutput)).toEqual(visualizedOutput);
          }
        });
      }

      const isUnstable = unstableTests.get(filename);
      const isUnstableTest = isUnstable && isUnstable(options || {});
      if (
        DEEP_COMPARE &&
        (formatted !== input || isUnstableTest) &&
        typeof rangeStart === "undefined" &&
        typeof rangeEnd === "undefined" &&
        typeof cursorOffset === "undefined" &&
        !TEST_CRLF
      ) {
        test("second format", () => {
          const secondOutput = format(formatted, filename, mainOptions);
          if (isUnstableTest) {
            // To keep eye on failed tests, this assert never supposed to pass,
            // if it fails, just remove the file from `unstableTests`
            expect(secondOutput).not.toEqual(formatted);
          } else {
            expect(secondOutput).toEqual(formatted);
          }
        });
      }

      if (AST_COMPARE && formatted !== input) {
        test("compare AST", () => {
          const { cursorOffset, ...parseOptions } = mainOptions;
          const originalAst = parse(input, parseOptions);
          const formattedAst = parse(formatted, parseOptions);
          expect(formattedAst).toEqual(originalAst);
        });
      }
    });
  }
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(source, filename, options) {
  const result = prettier.formatWithCursor(source, {
    filepath: filename,
    ...options,
  });

  if (result.then) {
    return result.then((result) =>
      options.cursorOffset >= 0
        ? result.formatted.slice(0, result.cursorOffset) +
          CURSOR_PLACEHOLDER +
          result.formatted.slice(result.cursorOffset)
        : result.formatted
    );
  }

  return options.cursorOffset >= 0
    ? result.formatted.slice(0, result.cursorOffset) +
        CURSOR_PLACEHOLDER +
        result.formatted.slice(result.cursorOffset)
    : result.formatted;
}
