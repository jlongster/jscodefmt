---
id: version-stable-plugins
title: Plugins
original_id: plugins
---

Plugins are ways of adding new languages to Prettier. Prettier's own implementations of all languages are expressed using the plugin API. The core `prettier` package contains JavaScript and other web-focused languages built in. For additional languages you'll need to install a plugin.

## Using Plugins

Plugins are automatically loaded if you have them installed in the same `node_modules` directory where `prettier` is located. Plugin package names must start with `@prettier/plugin-` or `prettier-plugin-` or `@<scope>/prettier-plugin-` to be registered.

> `<scope>` should be replaced by a name, read more about [NPM scope](https://docs.npmjs.com/misc/scope.html).

When plugins cannot be found automatically, you can load them with:

- The [CLI](cli.md), via the `--plugin` and `--plugin-search-dir`:

  ```bash
  prettier --write main.foo --plugin-search-dir=./dir-with-plugins --plugin=./foo-plugin
  ```

  > Tip: You can set `--plugin` or `--plugin-search-dir` options multiple times.

- Or the [API](api.md), via the `plugins` and `pluginSearchDirs` options:

  ```js
  prettier.format("code", {
    parser: "foo",
    pluginSearchDirs: ["./dir-with-plugins"],
    plugins: ["./foo-plugin"],
  });
  ```

Prettier expects each of `pluginSearchDirs` to contain `node_modules` subdirectory, where `@prettier/plugin-*`, `@*/prettier-plugin-*` and `prettier-plugin-*` will be searched. For instance, this can be your project directory or the location of global npm modules.

Providing at least one path to `--plugin-search-dir`/`pluginSearchDirs` turns off plugin autoloading in the default directory (i.e. `node_modules` above `prettier` binary).

## Official Plugins

- [`@prettier/plugin-php`](https://github.com/prettier/plugin-php)
- [`@prettier/plugin-pug`](https://github.com/prettier/plugin-pug) by [**@Shinigami92**](https://github.com/Shinigami92)
- [`@prettier/plugin-ruby`](https://github.com/prettier/plugin-ruby)
- [`@prettier/plugin-swift`](https://github.com/prettier/plugin-swift)
- [`@prettier/plugin-xml`](https://github.com/prettier/plugin-xml)

## Community Plugins

- [`prettier-plugin-apex`](https://github.com/dangmai/prettier-plugin-apex) by [**@dangmai**](https://github.com/dangmai)
- [`prettier-plugin-elm`](https://github.com/gicentre/prettier-plugin-elm) by [**@giCentre**](https://github.com/gicentre)
- [`prettier-plugin-java`](https://github.com/jhipster/prettier-java) by [**@JHipster**](https://github.com/jhipster)
- [`prettier-plugin-kotlin`](https://github.com/Angry-Potato/prettier-plugin-kotlin) by [**@Angry-Potato**](https://github.com/Angry-Potato)
- [`prettier-plugin-package`](https://github.com/shellscape/prettier-plugin-package) by [**@shellscape**](https://github.com/shellscape)
- [`prettier-plugin-packagejson`](https://github.com/matzkoh/prettier-plugin-packagejson) by [**@matzkoh**](https://github.com/matzkoh)
- [`prettier-plugin-pg`](https://github.com/benjie/prettier-plugin-pg) by [**@benjie**](https://github.com/benjie)
- [`prettier-plugin-solidity`](https://github.com/prettier-solidity/prettier-plugin-solidity) by [**@mattiaerre**](https://github.com/mattiaerre)
- [`prettier-plugin-svelte`](https://github.com/UnwrittenFun/prettier-plugin-svelte) by [**@UnwrittenFun**](https://github.com/UnwrittenFun)
- [`prettier-plugin-toml`](https://github.com/bd82/toml-tools/tree/master/packages/prettier-plugin-toml) by [**@bd82**](https://github.com/bd82)
- [`prettier-plugin-organize-imports`](https://github.com/simonhaenisch/prettier-plugin-organize-imports) by [**@simonhaenisch**](https://github.com/simonhaenisch)

## Developing Plugins

Prettier plugins are regular JavaScript modules with five exports:

- `languages`
- `parsers`
- `printers`
- `options`
- `defaultOptions`

### `languages`

Languages is an array of language definitions that your plugin will contribute to Prettier. It can include all of the fields specified in [`prettier.getSupportInfo()`](api.md#prettiergetsupportinfo).

It **must** include `name` and `parsers`.

```js
export const languages = [
  {
    // The language name
    name: "InterpretedDanceScript",
    // Parsers that can parse this language.
    // This can be built-in parsers, or parsers you have contributed via this plugin.
    parsers: ["dance-parse"],
  },
];
```

### `parsers`

Parsers convert code as a string into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

The key must match the name in the `parsers` array from `languages`. The value contains a parse function, an AST format name, and two location extraction functions (`locStart` and `locEnd`).

```js
export const parsers = {
  "dance-parse": {
    parse,
    // The name of the AST that
    astFormat: "dance-ast",
    hasPragma,
    locStart,
    locEnd,
    preprocess,
  },
};
```

The signature of the `parse` function is:

```ts
function parse(text: string, parsers: object, options: object): AST;
```

The location extraction functions (`locStart` and `locEnd`) return the starting and ending locations of a given AST node:

```ts
function locStart(node: object): number;
```

_(Optional)_ The pragma detection function (`hasPragma`) should return if the text contains the pragma comment.

```ts
function hasPragma(text: string): boolean;
```

_(Optional)_ The preprocess function can process the input text before passing into `parse` function.

```ts
function preprocess(text: string, options: object): string;
```

### `printers`

Printers convert ASTs into a Prettier intermediate representation, also known as a Doc.

The key must match the `astFormat` that the parser produces. The value contains an object with a `print` function and (optionally) an `embed` function.

```js
export const printers = {
  "dance-ast": {
    print,
    embed,
    insertPragma,
  },
};
```

Printing is a recursive process of converting an AST node (represented by a path to that node) into a doc. The doc is constructed using the [builder commands](https://github.com/prettier/prettier/blob/master/commands.md):

```js
const { concat, join, line, ifBreak, group } = require("prettier").doc.builders;
```

The signature of the `print` function is:

```ts
function print(
  // Path to the AST node to print
  path: FastPath,
  options: object,
  // Recursively print a child node
  print: (path: FastPath) => Doc
): Doc;
```

Check out [prettier-python's printer](https://github.com/prettier/prettier-python/blob/034ba8a9551f3fa22cead41b323be0b28d06d13b/src/printer.js#L174) as an example.

Embedding refers to printing one language inside another. Examples of this are CSS-in-JS and Markdown code blocks. Plugins can switch to alternate languages using the `embed` function. Its signature is:

```ts
function embed(
  // Path to the current AST node
  path: FastPath,
  // Print a node with the current printer
  print: (path: FastPath) => Doc,
  // Parse and print some text using a different parser.
  // You should set `options.parser` to specify which parser to use.
  textToDoc: (text: string, options: object) => Doc,
  // Current options
  options: object
): Doc | null;
```

If you don't want to switch to a different parser, simply return `null` or `undefined`.

A plugin can implement how a pragma comment is inserted in the resulting code when the `--insert-pragma` option is used, in the `insertPragma` function. Its signature is:

```ts
function insertPragma(text: string): string;
```

_(Optional)_ The preprocess function can process the ast from parser before passing into `print` function.

```ts
function preprocess(ast: AST, options: object): AST;
```

### `options`

`options` is an object containing the custom options your plugin supports.

Example:

```js
options: {
  openingBraceNewLine: {
    type: "boolean",
    category: "Global",
    default: true,
    description: "Move open brace for code blocks onto new line."
  }
}
```

### `defaultOptions`

If your plugin requires different default values for some of Prettier's core options, you can specify them in `defaultOptions`:

```
defaultOptions: {
  tabWidth: 4
}
```

### Utility functions

A `util` module from Prettier core is considered a private API and is not meant to be consumed by plugins. Instead, the `util-shared` module provides the following limited set of utility functions for plugins:

<!-- prettier-ignore -->
```ts
type Quote = '"' | "'";
type SkipOptions = { backwards?: boolean };
function getMaxContinuousCount(str: string, target: string): number;
function getStringWidth(text: string): number;
function getAlignmentSize(value: string, tabWidth: number, startIndex?: number): number;
function getIndentSize(value: string, tabWidth: number): number;
function skip(chars: string | RegExp): (text: string, index: number | false, opts?: SkipOptions) => number | false;
function skipWhitespace(text: string, index: number | false, opts?: SkipOptions): number | false;
function skipSpaces(text: string, index: number | false, opts?: SkipOptions): number | false;
function skipToLineEnd(text: string, index: number | false, opts?: SkipOptions): number | false;
function skipEverythingButNewLine(text: string, index: number | false, opts?: SkipOptions): number | false;
function skipInlineComment(text: string, index: number | false): number | false;
function skipTrailingComment(text: string, index: number | false): number | false;
function skipNewline(text: string, index: number | false, opts?: SkipOptions): number | false;
function hasNewline(text: string, index: number, opts?: SkipOptions): boolean;
function hasNewlineInRange(text: string, start: number, end: number): boolean;
function hasSpaces(text: string, index: number, opts?: SkipOptions): boolean;
function makeString(rawContent: string, enclosingQuote: Quote, unescapeUnnecessaryEscapes?: boolean): string;
function getNextNonSpaceNonCommentCharacterIndex<N>(text: string, node: N, locEnd: (node: N) => number): number | false;
function isNextLineEmptyAfterIndex(text: string, index: number): boolean;
function isNextLineEmpty<N>(text: string, node: N, locEnd: (node: N) => number): boolean;
function isPreviousLineEmpty<N>(text: string, node: N, locStart: (node: N) => number): boolean;
```

### Tutorials

- [How to write a plugin for Prettier](https://medium.com/@fvictorio/how-to-write-a-plugin-for-prettier-a0d98c845e70): Teaches you how to write a very basic Prettier plugin for TOML.

## Testing Plugins

Since plugins can be resolved using relative paths, when working on one you can do:

```js
const prettier = require("prettier");
const code = "(add 1 2)";
prettier.format(code, {
  parser: "lisp",
  plugins: ["."],
});
```

This will resolve a plugin relative to the current working directory.
