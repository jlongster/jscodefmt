"use strict";

const path = require("path");
const { ConfigError } = require("../common/errors");
const jsLoc = require("../language-js/loc");

const { locStart, locEnd } = jsLoc;

// Use defineProperties()/getOwnPropertyDescriptor() to prevent
// triggering the parsers getters.
const ownNames = Object.getOwnPropertyNames;
const ownDescriptor = Object.getOwnPropertyDescriptor;
function getParsers(options) {
  const parsers = {};
  for (const plugin of options.plugins) {
    if (!plugin.parsers) {
      continue;
    }

    for (const name of ownNames(plugin.parsers)) {
      Object.defineProperty(parsers, name, ownDescriptor(plugin.parsers, name));
    }
  }

  return parsers;
}

function resolveParser(opts, parsers) {
  parsers = parsers || getParsers(opts);

  if (typeof opts.parser === "function") {
    // Custom parser API always works with JavaScript.
    return {
      parse: opts.parser,
      astFormat: "estree",
      locStart,
      locEnd,
    };
  }

  if (typeof opts.parser === "string") {
    if (Object.prototype.hasOwnProperty.call(parsers, opts.parser)) {
      return parsers[opts.parser];
    }

    /* istanbul ignore next */
    if (process.env.PRETTIER_TARGET === "universal") {
      throw new ConfigError(
        `Couldn't resolve parser "${opts.parser}". Parsers must be explicitly added to the standalone bundle.`
      );
    } else {
      try {
        return {
          parse: eval("require")(path.resolve(process.cwd(), opts.parser)),
          astFormat: "estree",
          locStart,
          locEnd,
        };
      } catch (err) {
        /* istanbul ignore next */
        throw new ConfigError(`Couldn't resolve parser "${opts.parser}"`);
      }
    }
  }
}

function parse(text, opts) {
  const parsers = getParsers(opts);

  // Create a new object {parserName: parseFn}. Uses defineProperty() to only call
  // the parsers getters when actually calling the parser `parse` function.
  const parsersForCustomParserApi = Object.keys(parsers).reduce(
    (object, parserName) =>
      Object.defineProperty(object, parserName, {
        enumerable: true,
        get() {
          return parsers[parserName].parse;
        },
      }),
    {}
  );

  const parser = resolveParser(opts, parsers);

  try {
    if (parser.preprocess) {
      text = parser.preprocess(text, opts);
    }

    return {
      text,
      ast: parser.parse(text, parsersForCustomParserApi, opts),
    };
  } catch (error) {
    const { loc } = error;

    if (loc) {
      const codeFrame = require("@babel/code-frame");
      error.codeFrame = codeFrame.codeFrameColumns(text, loc, {
        highlightCode: true,
      });
      error.message += "\n" + error.codeFrame;
      throw error;
    }

    /* istanbul ignore next */
    throw error.stack;
  }
}

module.exports = { parse, resolveParser };
