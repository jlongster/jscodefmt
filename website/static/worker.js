/* globals prettier prettierPlugins parsersLocation */

"use strict";

self.PRETTIER_DEBUG = true;

const imported = Object.create(null);
function importScriptOnce(url) {
  if (!imported[url]) {
    imported[url] = true;
    importScripts(url);
  }
}

importScripts("lib/parsers-location.js");
importScripts("lib/standalone.js");

// this is required to only load parsers when we need them
const parsers = Object.create(null);
for (const file in parsersLocation) {
  const { parsers: moduleParsers, property } = parsersLocation[file];
  const url = `lib/${file}`;
  for (const parserName of moduleParsers) {
    Object.defineProperty(parsers, parserName, {
      get() {
        importScriptOnce(url);
        return prettierPlugins[property].parsers[parserName];
      },
    });
  }
}

const docExplorerPlugin = {
  parsers: {
    "doc-explorer": {
      parse: (text) =>
        new Function(
          `{ ${Object.keys(prettier.doc.builders)} }`,
          `const result = (${text || "''"}\n); return result;`
        )(prettier.doc.builders),
      astFormat: "doc-explorer",
    },
  },
  printers: {
    "doc-explorer": {
      print: (path) => path.getValue(),
    },
  },
  languages: [{ name: "doc-explorer", parsers: ["doc-explorer"] }],
};

self.onmessage = function (event) {
  self.postMessage({
    uid: event.data.uid,
    message: handleMessage(event.data.message),
  });
};

function serializeAst(ast) {
  return JSON.stringify(
    ast,
    (_, value) =>
      value instanceof Error
        ? { name: value.name, message: value.message, ...value }
        : typeof value === "bigint"
        ? `BigInt('${String(value)}')`
        : typeof value === "symbol"
        ? String(value)
        : value,
    2
  );
}

function handleMessage(message) {
  if (message.type === "meta") {
    return {
      type: "meta",
      supportInfo: JSON.parse(
        JSON.stringify(
          prettier.getSupportInfo({
            showUnreleased: true,
            plugins: [docExplorerPlugin],
          })
        )
      ),
      version: prettier.version,
    };
  }

  if (message.type === "format") {
    const options = message.options || {};

    delete options.ast;
    delete options.doc;
    delete options.output2;

    const plugins = [{ parsers }, docExplorerPlugin];
    options.plugins = plugins;

    const formatResult = formatCode(message.code, options);

    const response = {
      formatted: formatResult.formatted,
      cursorOffset: formatResult.cursorOffset,
      error: formatResult.error,
      debug: {
        ast: null,
        doc: null,
        comments: null,
        reformatted: null,
      },
    };

    if (message.debug.ast) {
      let ast;
      let errored = false;
      try {
        ast = serializeAst(prettier.__debug.parse(message.code, options).ast);
      } catch (e) {
        errored = true;
        ast = String(e);
      }

      if (!errored) {
        try {
          ast = formatCode(ast, { parser: "json", plugins }).formatted;
        } catch {
          ast = serializeAst(ast);
        }
      }
      response.debug.ast = ast;
    }

    if (message.debug.doc) {
      try {
        response.debug.doc = prettier.__debug.formatDoc(
          prettier.__debug.printToDoc(message.code, options),
          { plugins }
        );
      } catch {
        response.debug.doc = "";
      }
    }

    if (message.debug.comments) {
      response.debug.comments = formatCode(
        JSON.stringify(formatResult.comments || []),
        { parser: "json", plugins }
      ).formatted;
    }

    if (message.debug.reformat) {
      response.debug.reformatted = formatCode(
        response.formatted,
        options
      ).formatted;
    }

    return response;
  }
}

function formatCode(text, options) {
  try {
    return prettier.formatWithCursor(text, options);
  } catch (e) {
    if (e.constructor && e.constructor.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return { formatted: String(e), error: true };
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return { formatted: stringifyError(e), error: true };
  }
}

function stringifyError(e) {
  const stringified = String(e);
  if (typeof e.stack !== "string") {
    return stringified;
  }
  if (e.stack.includes(stringified)) {
    // Chrome
    return e.stack;
  }
  // Firefox
  return stringified + "\n" + e.stack;
}
