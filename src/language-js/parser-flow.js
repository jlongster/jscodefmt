"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./parse-postprocess");
const { isSourceElement } = require("./source-elements");

function parse(text, parsers, opts) {
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
    enums: true,
    esproposal_decorators: true,
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true,
    esproposal_optional_chaining: true,
    esproposal_nullish_coalescing: true,
    tokens: true,
  });

  const [error] = ast.errors;
  if (error) {
    const {
      message,
      loc: { start, end },
    } = error;

    throw createError(message, {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    });
  }

  return postprocess(ast, { ...opts, originalText: text });
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    flow: {
      parse,
      astFormat: "estree",
      hasPragma,
      locStart,
      locEnd,
      isSourceElement,
    },
  },
};
