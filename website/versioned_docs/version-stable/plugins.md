---
id: version-stable-plugins
title: Plugins
original_id: plugins
---

Plugins are ways of adding new languages to Prettier. Prettier’s own implementations of all languages are expressed using the plugin API. The core `prettier` package contains JavaScript and other web-focused languages built in. For additional languages you’ll need to install a plugin.

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
- [`prettier-plugin-go-template`](https://github.com/NiklasPor/prettier-plugin-go-template) by [**@NiklasPor**](https://github.com/NiklasPor)
- [`prettier-plugin-java`](https://github.com/jhipster/prettier-java) by [**@JHipster**](https://github.com/jhipster)
- [`prettier-plugin-jsdoc`](https://github.com/hosseinmd/prettier-plugin-jsdoc) by [**@hosseinmd**](https://github.com/hosseinmd)
- [`prettier-plugin-kotlin`](https://github.com/Angry-Potato/prettier-plugin-kotlin) by [**@Angry-Potato**](https://github.com/Angry-Potato)
- [`prettier-plugin-package`](https://github.com/shellscape/prettier-plugin-package) by [**@shellscape**](https://github.com/shellscape)
- [`prettier-plugin-packagejson`](https://github.com/matzkoh/prettier-plugin-packagejson) by [**@matzkoh**](https://github.com/matzkoh)
- [`prettier-plugin-pg`](https://github.com/benjie/prettier-plugin-pg) by [**@benjie**](https://github.com/benjie)
- [`prettier-plugin-properties`](https://github.com/eemeli/prettier-plugin-properties) by [**@eemeli**](https://github.com/eemeli)
- [`prettier-plugin-solidity`](https://github.com/prettier-solidity/prettier-plugin-solidity) by [**@mattiaerre**](https://github.com/mattiaerre)
- [`prettier-plugin-svelte`](https://github.com/UnwrittenFun/prettier-plugin-svelte) by [**@UnwrittenFun**](https://github.com/UnwrittenFun)
- [`prettier-plugin-tailwind`](https://github.com/Acidic9/prettier-plugin-tailwind) by [**@Acidic9**](https://github.com/Acidic9)
- [`prettier-plugin-toml`](https://github.com/bd82/toml-tools/tree/master/packages/prettier-plugin-toml) by [**@bd82**](https://github.com/bd82)
- [`prettier-plugin-pkg`](https://github.com/rx-ts/prettier/tree/master/packages/pkg) by [**@JounQin**](https://github.com/JounQin)
- [`prettier-plugin-sh`](https://github.com/rx-ts/prettier/tree/master/packages/sh) by [**@JounQin**](https://github.com/JounQin)

## Experimental Plugins

These plugins provide functionality not supported with Plugin API. Use with caution.

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

The key must match the `astFormat` that the parser produces. The value contains an object with a `print` function. All other properties (`embed`, `preprocess`, etc.) are optional.

```js
export const printers = {
  "dance-ast": {
    print,
    embed,
    preprocess,
    insertPragma,
    canAttachComment,
    isBlockComment,
    printComment,
    handleComments: {
      ownLine,
      endOfLine,
      remaining,
    },
  },
};
```

#### The printing process

Prettier uses an intermediate representation, called a Doc, which Prettier then turns into a string (based on options like `printWidth`). A _printer_'s job is to take the AST generated by `parsers[<parser name>].parse` and return a Doc. A Doc is constructed using [builder commands](https://github.com/prettier/prettier/blob/main/commands.md):

```js
const { concat, join, line, ifBreak, group } = require("prettier").doc.builders;
```

The printing process works as follows:

1. `preprocess(ast: AST, options: object): AST`, if available, is called. It is passed the AST from the _parser_. The AST returned by `preprocess` will be used by Prettier. If `preprocess` is not defined, the AST returned from the _parser_ will be used.
2. Comments are attached to the AST (see _Handling comments in a printer_ for details).
3. A Doc is recursively constructed from the AST. i) `embed(path: AstPath, print, textToDoc, options: object): Doc | null` is called on each AST node. If `embed` returns a Doc, that Doc is used. ii) If `embed` is undefined or returns a falsy value, `print(path: AstPath, options: object, print): Doc` is called on each AST node.

#### `print`

Most of the work of a plugin's printer will take place in its `print` function, whose signature is:

```ts
function print(
  // Path to the AST node to print
  path: AstPath,
  options: object,
  // Recursively print a child node
  print: (path: AstPath) => Doc
): Doc;
```

The `print` function is passed a `path` object, which can be used to access nodes in the AST via `path.getValue()`. It is also passed a persistent `options` object (which contains global options and which a plugin may mutate), and a `print` function used for making recursive calls. A basic `print` function might be as follows:

```js
const { builders } = require("prettier").doc;

function print(path, options, print) {
  const node = path.getValue();

  if (Array.isArray(node)) {
    return builders.concat(path.map(print));
  }
  return node.value;
}
```

Check out [prettier-python's printer](https://github.com/prettier/prettier-python/blob/034ba8a9551f3fa22cead41b323be0b28d06d13b/src/printer.js#L174) for some examples of what is possible.

#### (optional) `embed`

The `embed` function is called when the plugin needs to print one language inside another. Examples of this are printing CSS-in-JS or fenced code blocks in Markdown. Its signature is:

```ts
function embed(
  // Path to the current AST node
  path: AstPath,
  // Print a node with the current printer
  print: (path: AstPath) => Doc,
  // Parse and print some text using a different parser.
  // You should set `options.parser` to specify which parser to use.
  textToDoc: (text: string, options: object) => Doc,
  // Current options
  options: object
): Doc | null;
```

The `embed` function acts like the `print` function, except that it is passed an additional `textToDoc` function, which can be used to render a doc using a different plugin. The `embed` function returns a Doc or a falsy value. If a falsy value is returned, the `print` function is called with the current `path`. If a Doc is returned, that Doc is used in printing and the `print` function is not called.

For example, a plugin that had nodes with embedded JavaScript might have the following `embed` function:

```js
function embed(path, print, textToDoc, options) {
  const node = path.getValue();
  if (node.type === "javascript") {
    return textToDoc(node.javaScriptText, { ...options, parser: "babel" });
  }
  return false;
}
```

#### (optional) `preprocess`

The preprocess function can process the AST from parser before passing into `print` function.

```ts
function preprocess(ast: AST, options: object): AST;
```

#### (optional) `insertPragma`

A plugin can implement how a pragma comment is inserted in the resulting code when the `--insert-pragma` option is used, in the `insertPragma` function. Its signature is:

```ts
function insertPragma(text: string): string;
```

#### Handling comments in a printer

Comments are often not part of a language's AST and present a challenge for pretty printers. A Prettier plugin can either print comments itself in its `print` function or rely on Prettier's comment algorithm.

By default, if the AST has a top-level `comments` property, Prettier assumes that `comments` stores an array of comment nodes. Prettier will then use the provided `parsers[<plugin>].locStart`/`locEnd` functions to search for the AST node that each comment "belongs" to. Comments are then attached to these nodes **mutating the AST in the process**, and the `comments` property is deleted from the AST root. The `*Comment` functions are used to adjust Prettier's algorithm. Once the comments are attached to the AST, Prettier will automatically call the `printComment(path, options): Doc` function and insert the returned doc into the (hopefully) correct place.

#### (optional) `printComment`

Called whenever a comment node needs to be printed. It has the signature:

```ts
function printComment(
  // Path to the current comment node
  commentPath: AstPath,
  // Current options
  options: object
): Doc;
```

#### (optional) `canAttachComment`

```ts
function canAttachComment(node: AST): boolean;
```

This function is used for deciding whether a comment can be attached to a particular AST node. By default, _all_ AST properties are traversed searching for nodes that comments can be attached to. This function is used to prevent comments from being attached to a particular node. A typical implementation looks like

```js
function canAttachComment(node) {
  return node.type && node.type !== "comment";
}
```

#### (optional) `isBlockComment`

```ts
function isBlockComment(node: AST): boolean;
```

Returns whether or not the AST node is a block comment.

#### (optional) `handleComments`

The `handleComments` object contains three optional functions, each with signature

```ts
function(
	// The AST node corresponding to the comment
	comment: AST,
	// The full source code text
	text: string,
	// The global options object
	options: object,
	// The AST
	ast: AST,
	// Whether this comment is the last comment
	isLastComment: boolean
): boolean
```

These functions are used to override Prettier's default comment attachment algorithm. `ownLine`/`endOfLine`/`remaining` is expected to either manually attach a comment to a node and return `true`, or return `false` and let Prettier attach the comment.

Based on the text surrounding a comment node, Prettier dispatches:

- `ownLine` if a comment has only whitespace preceding it and a newline afterwards,
- `endOfLine` if a comment has a newline afterwards but some non-whitespace preceding it,
- `remaining` in all other cases.

At the time of dispatching, Prettier will have annotated each AST comment node (i.e., created new properties) with at least one of `enclosingNode`, `precedingNode`, or `followingNode`. These can be used to aid a plugin's decision process (of course the entire AST and original text is also passed in for making more complicated decisions).

#### Manually attaching a comment

The `util.addTrailingComment`/`addLeadingComment`/`addDanglingComment` functions can be used to manually attach a comment to an AST node. An example `ownLine` function that ensures a comment does not follow a "punctuation" node (made up for demonstration purposes) might look like:

```js
const { util } = require("prettier");

function ownLine(comment, text, options, ast, isLastComment) {
  const { precedingNode } = comment;
  if (precedingNode && precedingNode.type === "punctuation") {
    util.addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}
```

Nodes with comments are expected to have a `comments` property containing an array of comments. Each comment is expected to have the following properties: `leading`, `trailing`, `printed`.

<!-- TODO: add a note that this might change in the future -->

The example above uses `util.addTrailingComment`, which automatically sets `comment.leading`/`trailing`/`printed` to appropriate values and adds the comment to the AST node's `comments` array.

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

If your plugin requires different default values for some of Prettier’s core options, you can specify them in `defaultOptions`:

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
