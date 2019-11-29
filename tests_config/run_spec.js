"use strict";

const fs = require("fs");
const path = require("path");
const raw = require("jest-snapshot-serializer-raw").wrap;

const AST_COMPARE = process.env["AST_COMPARE"];
const TEST_STANDALONE = process.env["TEST_STANDALONE"];
const TEST_CRLF = process.env["TEST_CRLF"];

const CURSOR_PLACEHOLDER = "<|>";
const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";

const prettier = !TEST_STANDALONE
  ? require("prettier/local")
  : require("prettier/standalone");

global.run_spec = (dirname, parsers, options) => {
  // istanbul ignore next
  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  if (parsers[0] === "js-all") {
    parsers = ["babel", "babel-flow", "flow", "typescript"];
  }

  if (parsers[0] === "babel-all") {
    parsers = ["babel", "babel-flow"].concat(parsers.slice(1));
  }

  fs.readdirSync(dirname).forEach(basename => {
    const filename = path.join(dirname, basename);

    if (
      path.extname(basename) === ".snap" ||
      !fs.lstatSync(filename).isFile() ||
      basename[0] === "." ||
      basename === "jsfmt.spec.js"
    ) {
      return;
    }

    let rangeStart;
    let rangeEnd;
    let cursorOffset;

    const text = fs.readFileSync(filename, "utf8");

    const source = (TEST_CRLF ? text.replace(/\n/g, "\r\n") : text)
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

    const baseOptions = Object.assign({ printWidth: 80 }, options, {
      rangeStart,
      rangeEnd,
      cursorOffset
    });
    const mainOptions = Object.assign({}, baseOptions, {
      parser: parsers[0]
    });

    const hasEndOfLine = "endOfLine" in mainOptions;

    const output = format(input, filename, mainOptions);
    const visualizedOutput = visualizeEndOfLine(output);

    test(basename, () => {
      expect(visualizedOutput).toEqual(
        visualizeEndOfLine(consistentEndOfLine(output))
      );
      expect(
        raw(
          createSnapshot(
            hasEndOfLine
              ? visualizeEndOfLine(
                  text
                    .replace(RANGE_START_PLACEHOLDER, "")
                    .replace(RANGE_END_PLACEHOLDER, "")
                )
              : source,
            hasEndOfLine ? visualizedOutput : output,
            Object.assign({}, baseOptions, { parsers })
          )
        )
      ).toMatchSnapshot();
    });

    for (const parser of parsers.slice(1)) {
      const verifyOptions = Object.assign({}, baseOptions, { parser });
      test(`${basename} - ${parser}-verify`, () => {
        const verifyOutput = format(input, filename, verifyOptions);
        expect(visualizedOutput).toEqual(visualizeEndOfLine(verifyOutput));
      });
    }

    if (AST_COMPARE) {
      test(`${filename} parse`, () => {
        const parseOptions = Object.assign({}, mainOptions);
        delete parseOptions.cursorOffset;

        const originalAst = parse(input, parseOptions);
        let formattedAst;

        expect(() => {
          formattedAst = parse(
            output.replace(CURSOR_PLACEHOLDER, ""),
            parseOptions
          );
        }).not.toThrow();
        expect(originalAst).toEqual(formattedAst);
      });
    }
  });
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(source, filename, options) {
  const result = prettier.formatWithCursor(
    source,
    Object.assign({ filepath: filename }, options)
  );

  return options.cursorOffset >= 0
    ? result.formatted.slice(0, result.cursorOffset) +
        CURSOR_PLACEHOLDER +
        result.formatted.slice(result.cursorOffset)
    : result.formatted;
}

function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/g, endOfLine => {
    if (!firstEndOfLine) {
      firstEndOfLine = endOfLine;
    }
    return firstEndOfLine;
  });
}

function visualizeEndOfLine(text) {
  return text.replace(/\r\n?|\n/g, endOfLine => {
    switch (endOfLine) {
      case "\n":
        return "<LF>\n";
      case "\r\n":
        return "<CRLF>\n";
      case "\r":
        return "<CR>\n";
      default:
        throw new Error(`Unexpected end of line ${JSON.stringify(endOfLine)}`);
    }
  });
}

function createSnapshot(input, output, options) {
  const separatorWidth = 80;
  const printWidthIndicator =
    options.printWidth > 0 && Number.isFinite(options.printWidth)
      ? " ".repeat(options.printWidth) + "| printWidth"
      : [];
  return []
    .concat(
      printSeparator(separatorWidth, "options"),
      printOptions(
        omit(
          options,
          k => k === "rangeStart" || k === "rangeEnd" || k === "cursorOffset"
        )
      ),
      printWidthIndicator,
      printSeparator(separatorWidth, "input"),
      input,
      printSeparator(separatorWidth, "output"),
      output,
      printSeparator(separatorWidth)
    )
    .join("\n");
}

function printSeparator(width, description) {
  description = description || "";
  const leftLength = Math.floor((width - description.length) / 2);
  const rightLength = width - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function printOptions(options) {
  const keys = Object.keys(options).sort();
  return keys.map(key => `${key}: ${stringify(options[key])}`).join("\n");
  function stringify(value) {
    return value === Infinity
      ? "Infinity"
      : Array.isArray(value)
      ? `[${value.map(v => JSON.stringify(v)).join(", ")}]`
      : JSON.stringify(value);
  }
}

function omit(obj, fn) {
  return Object.keys(obj).reduce((reduced, key) => {
    const value = obj[key];
    if (!fn(key, value)) {
      reduced[key] = value;
    }
    return reduced;
  }, {});
}
