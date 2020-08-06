/* eslint-env worker */
/* eslint no-var: off, strict: off */
/* globals prettier prettierPlugins parsersLocation */

var imported = Object.create(null);
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

// eslint-disable-next-line no-unused-vars
var PRETTIER_DEBUG = true;

self.onmessage = function (event) {
  self.postMessage({
    uid: event.data.uid,
    message: handleMessage(event.data.message),
  });
};

function handleMessage(message) {
  if (message.type === "meta") {
    return {
      type: "meta",
      supportInfo: JSON.parse(
        JSON.stringify(
          prettier.getSupportInfo({
            showUnreleased: true,
          })
        )
      ),
      version: prettier.version,
    };
  }

  if (message.type === "format") {
    var options = message.options || {};
    if (typeof options.debugMode === "boolean") {
      PRETTIER_DEBUG = options.debugMode;
      delete options.debugMode;
    }

    delete options.ast;
    delete options.doc;
    delete options.output2;

    var plugins = [{ parsers }];
    options.plugins = plugins;

    var response = {
      formatted: formatCode(message.code, options),
      debug: {
        ast: null,
        doc: null,
        reformatted: null,
      },
    };

    if (message.debug.ast) {
      var ast;
      var errored = false;
      try {
        ast = JSON.stringify(prettier.__debug.parse(message.code, options).ast);
      } catch (e) {
        errored = true;
        ast = String(e);
      }

      if (!errored) {
        try {
          ast = formatCode(ast, { parser: "json", plugins });
        } catch (e) {
          ast = JSON.stringify(ast, null, 2);
        }
      }
      response.debug.ast = ast;
    }

    if (message.debug.doc) {
      try {
        response.debug.doc = prettier.__debug.formatDoc(
          prettier.__debug.printToDoc(message.code, options),
          { parser: "babel", plugins }
        );
      } catch (e) {
        response.debug.doc = String(e);
      }
    }

    if (message.debug.reformat) {
      response.debug.reformatted = formatCode(response.formatted, options);
    }

    return response;
  }
}

function formatCode(text, options) {
  try {
    return prettier.format(text, options);
  } catch (e) {
    if (e.constructor && e.constructor.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return String(e);
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return e.stack || String(e);
  }
}
