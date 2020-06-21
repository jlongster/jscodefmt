---
id: version-stable-browser
title: Browser
original_id: browser
---

Run Prettier in the browser with the `standalone.js` UMD bundle shipped in the NPM package (starting in version 1.13). The UMD bundle only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

### `prettier.format(code, options)`

Unlike the `format` function from the [main API](api.md#prettierformatsource--options), this function does not load plugins automatically, so a `plugins` property is required if you want to load plugins. Additionally, the parsers included in the Prettier package won't be loaded automatically, so you need to load them before using them.

See [Usage](#usage) below for examples.

## Usage

### Global

```html
<script src="https://unpkg.com/prettier@2.0.5/standalone.js"></script>
<script src="https://unpkg.com/prettier@2.0.5/parser-graphql.js"></script>
<script>
  prettier.format("query { }", {
    parser: "graphql",
    plugins: prettierPlugins,
  });
</script>
```

### ES Modules

```js
import prettier from "prettier/standalone";
import parserGraphql from "prettier/parser-graphql";

prettier.format("query { }", {
  parser: "graphql",
  plugins: [parserGraphql],
});
```

### AMD

```js
define([
  "https://unpkg.com/prettier@2.0.5/standalone.js",
  "https://unpkg.com/prettier@2.0.5/parser-graphql.js",
], (prettier, ...plugins) => {
  prettier.format("query { }", { parser: "graphql", plugins });
});
```

### CommonJS

```js
const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-graphql")];
prettier.format("query { }", { parser: "graphql", plugins });
```

This syntax doesn't necessarily work in the browser, but it can be used when bundling the code with browserify, Rollup, webpack, or another bundler.

### Worker

```js
importScripts("https://unpkg.com/prettier@2.0.5/standalone.js");
importScripts("https://unpkg.com/prettier@2.0.5/parser-graphql.js");
prettier.format("query { }", { parser: "graphql", plugins: prettierPlugins });
```
