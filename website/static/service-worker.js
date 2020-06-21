/* eslint-env serviceworker */
/* global toolbox */

"use strict";

importScripts("https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js");

toolbox.precache([
  // Scripts
  "lib/standalone.js",
  "lib/parser-angular.js",
  "lib/parser-babel.js",
  "lib/parser-flow.js",
  "lib/parser-glimmer.js",
  "lib/parser-graphql.js",
  "lib/parser-html.js",
  "lib/parser-markdown.js",
  "lib/parser-postcss.js",
  "lib/parser-typescript.js",
  "lib/parser-yaml.js",
  "playground.js",
  "https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js",

  // CodeMirror; keep this in sync with website/pages/playground/index.html
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/fold/foldgutter.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/javascript/javascript.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/xml/xml.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/jsx/jsx.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/css/css.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/markdown/markdown.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/display/placeholder.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/display/rulers.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/search/searchcursor.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/edit/matchbrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/edit/closebrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/comment/comment.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/wrap/hardwrap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/fold/foldcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/fold/foldgutter.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/addon/fold/brace-fold.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/keymap/sublime.min.js",

  "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.production.min.js",

  // Images
  "/prettier.png",
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
