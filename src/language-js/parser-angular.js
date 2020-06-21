"use strict";

const locFns = require("./loc");

function createParser(_parse) {
  const parse = (text, parsers, options) => {
    const ngEstreeParser = require("angular-estree-parser");
    const node = _parse(text, ngEstreeParser);
    return {
      type: "NGRoot",
      node:
        options.parser === "__ng_action" && node.type !== "NGChainedExpression"
          ? { ...node, type: "NGChainedExpression", expressions: [node] }
          : node,
    };
  };
  return { astFormat: "estree", parse, ...locFns };
}

module.exports = {
  parsers: {
    __ng_action: createParser((text, ng) => ng.parseAction(text)),
    __ng_binding: createParser((text, ng) => ng.parseBinding(text)),
    __ng_interpolation: createParser((text, ng) => ng.parseInterpolation(text)),
    __ng_directive: createParser((text, ng) => ng.parseTemplateBindings(text)),
  },
};
