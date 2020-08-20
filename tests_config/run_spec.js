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

const isUnstable = (filename, options) => {
  const testFunction = unstableTests.get(filename);

  if (!testFunction) {
    return false;
  }

  return testFunction(options);
};

const shouldThrowOnVerify = (filename, options) => {
  if (options.parser !== "babel-ts") {
    return false;
  }

  const { disableBabelTS } = options;

  if (disableBabelTS === true) {
    return true;
  }

  if (Array.isArray(disableBabelTS) && disableBabelTS.includes(filename)) {
    return true;
  }

  return false;
};

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
  const [parser, ...verifyParsers] = parsers;

  if (parsers.includes("typescript") && !parsers.includes("babel-ts")) {
    verifyParsers.push("babel-ts");
  }

  for (const { name, filename, code, output } of [...files, ...snippets]) {
    describe(`${name}${
      stringifiedOptions ? ` - ${stringifiedOptions}` : ""
    }`, () => {
      const formatOptions = {
        printWidth: 80,
        ...options,
        filepath: filename,
        parser,
      };

      if (IS_ERROR_TESTS) {
        test("error test", () => {
          expect(() => {
            format(code, formatOptions);
          }).toThrowErrorMatchingSnapshot();
        });
        return;
      }

      const eolReplacedCode = TEST_CRLF ? code.replace(/\n/g, "\r\n") : code;
      const firstFormat = format(eolReplacedCode, formatOptions);

      test("format", () => {
        // Make sure output has consistent EOL
        expect(firstFormat.eolVisualizedOutput).toEqual(
          visualizeEndOfLine(consistentEndOfLine(firstFormat.outputWithCursor))
        );

        if (typeof output === "string") {
          expect(firstFormat.output).toEqual(output);
          return;
        }

        const hasEndOfLine = "endOfLine" in formatOptions;
        let codeForSnapshot = hasEndOfLine
          ? code
              .replace(RANGE_START_PLACEHOLDER, "")
              .replace(RANGE_END_PLACEHOLDER, "")
          : firstFormat.inputWithCursor;
        let codeOffset = 0;
        let resultForSnapshot = firstFormat.outputWithCursor;
        const { rangeStart, rangeEnd } = firstFormat.options;

        if (typeof rangeStart === "number" || typeof rangeEnd === "number") {
          if (TEST_CRLF && hasEndOfLine) {
            codeForSnapshot = codeForSnapshot.replace(/\n/g, "\r\n");
          }
          codeForSnapshot = visualizeRange(codeForSnapshot, {
            rangeStart,
            rangeEnd,
          });
          codeOffset = codeForSnapshot.match(/^>?\s+1 \| /)[0].length;
        }

        // When `TEST_CRLF` and `endOfLine: "auto"`, the eol is always `\r\n`,
        // Replace it with guess result from original input
        let resultNote = "";
        if (formatOptions.endOfLine === "auto") {
          const {
            guessEndOfLine,
            convertEndOfLineToChars,
          } = require("../src/common/end-of-line");
          const originalAutoResult = convertEndOfLineToChars(
            guessEndOfLine(code)
          );
          if (originalAutoResult !== "\r\n") {
            resultNote +=
              "** The EOL of output might not real when `TEST_CRLF` **";

            if (TEST_CRLF) {
              resultForSnapshot = resultForSnapshot.replace(
                /\r\n?/g,
                originalAutoResult
              );
            }
          }
        }

        if (hasEndOfLine) {
          codeForSnapshot = visualizeEndOfLine(codeForSnapshot);
          resultForSnapshot = visualizeEndOfLine(resultForSnapshot);
        }

        if (resultNote) {
          resultForSnapshot = `${resultNote}\n${resultForSnapshot}`;
        }

        expect(
          createSnapshot(
            codeForSnapshot,
            resultForSnapshot,
            composeOptionsForSnapshot(firstFormat.options, parsers),
            { codeOffset }
          )
        ).toMatchSnapshot();
      });

      for (const parser of verifyParsers) {
        const verifyOptions = { ...firstFormat.options, parser };
        const runVerifyFormat = () => format(firstFormat.input, verifyOptions);

        if (shouldThrowOnVerify(name, verifyOptions)) {
          test(`verify (${parser})`, () => {
            expect(runVerifyFormat).toThrow(
              TEST_STANDALONE ? undefined : SyntaxError
            );
          });
        } else {
          const verifyFormat = runVerifyFormat();
          test(`verify (${parser})`, () => {
            expect(verifyFormat.eolVisualizedOutput).toEqual(
              firstFormat.eolVisualizedOutput
            );
          });

          if (AST_COMPARE && verifyFormat.changed && code.trim()) {
            test(`verify AST (${parser})`, () => {
              const originalAst = parse(verifyFormat.input, verifyOptions);
              const formattedAst = parse(verifyFormat.output, verifyOptions);
              expect(originalAst).toEqual(formattedAst);
            });
          }
        }
      }

      const isUnstableTest = isUnstable(filename, formatOptions);
      if (
        DEEP_COMPARE &&
        (firstFormat.changed || isUnstableTest) &&
        // No range and cursor
        firstFormat.input === eolReplacedCode
      ) {
        test("second format", () => {
          const { eolVisualizedOutput: firstOutput, output } = firstFormat;
          const { eolVisualizedOutput: secondOutput } = format(
            output,
            formatOptions
          );
          if (isUnstableTest) {
            // To keep eye on failed tests, this assert never supposed to pass,
            // if it fails, just remove the file from `unstableTests`
            expect(secondOutput).not.toEqual(firstOutput);
          } else {
            expect(secondOutput).toEqual(firstOutput);
          }
        });
      }

      if (AST_COMPARE && firstFormat.changed) {
        test("compare AST", () => {
          const { input, output } = firstFormat;
          const originalAst = parse(input, formatOptions);
          const formattedAst = parse(output, formatOptions);
          expect(formattedAst).toEqual(originalAst);
        });
      }
    });
  }
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(text, options) {
  options = {
    ...options,
  };

  const inputWithCursor = text
    .replace(RANGE_START_PLACEHOLDER, (match, offset) => {
      options.rangeStart = offset;
      return "";
    })
    .replace(RANGE_END_PLACEHOLDER, (match, offset) => {
      options.rangeEnd = offset;
      return "";
    });

  const input = inputWithCursor.replace(CURSOR_PLACEHOLDER, (match, offset) => {
    options.cursorOffset = offset;
    return "";
  });

  const result = prettier.formatWithCursor(input, options);
  const output = result.formatted;

  const outputWithCursor =
    options.cursorOffset >= 0
      ? output.slice(0, result.cursorOffset) +
        CURSOR_PLACEHOLDER +
        output.slice(result.cursorOffset)
      : output;
  const eolVisualizedOutput = visualizeEndOfLine(outputWithCursor);

  const changed = outputWithCursor !== inputWithCursor;

  return {
    changed,
    options,
    input,
    inputWithCursor,
    output,
    outputWithCursor,
    eolVisualizedOutput,
  };
}
