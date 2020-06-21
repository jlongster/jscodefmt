---
id: browser
title: Browser
---

Run Prettier in the browser with the `standalone.js` UMD bundle shipped in the NPM package (starting in version 1.13). The UMD bundle only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

The [`browser` field](https://github.com/defunctzombie/package-browser-field-spec) in Prettier's `package.json` points to `standalone.js`. That's why you can just `import` or `require` the `prettier` module to access Prettier's API, and your code can stay compatible with both Node and the browser as long as webpack or another bundler that supports the `browser` field is used. This is especially convenient for [plugins](plugins.md).

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

Note that the [`unpkg` field](https://unpkg.com/#examples) in Prettier's `package.json` points to `standalone.js`, that's why `https://unpkg.com/prettier` can also be used instead of `https://unpkg.com/prettier/standalone.js`.

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
