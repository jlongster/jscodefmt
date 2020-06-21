---
id: version-stable-api
title: API
original_id: api
---

```js
const prettier = require("prettier");
```

## `prettier.format(source [, options])`

`format` is used to format text using Prettier. [Options](options.md) may be provided to override the defaults. Set `options.parser` according to the language you are formatting (see the [list of available parsers](options.md#parser)).

```js
prettier.format("foo ( );", { semi: false, parser: "babel" });
// -> "foo()"
```

## `prettier.check(source [, options])`

`check` checks to see if the file has been formatted with Prettier given those options and returns a `Boolean`. This is similar to the `--check` or `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

## `prettier.formatWithCursor(source [, options])`

`formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code. This is useful for editor integrations, to prevent the cursor from moving when code is formatted.

The `cursorOffset` option should be provided, to specify where the cursor is. This option cannot be used with `rangeStart` and `rangeEnd`.

```js
prettier.formatWithCursor(" 1", { cursorOffset: 2, parser: "babel" });
// -> { formatted: '1;\n', cursorOffset: 1 }
```

## `prettier.resolveConfig(filePath [, options])`

`resolveConfig` can be used to resolve configuration for a given source file, passing its path as the first argument. The config search will start at the file path and continue to search up the directory (you can use `process.cwd()` to start searching from the current directory). Or you can pass directly the path of the config file as `options.config` if you don't wish to search for it. A promise is returned which will resolve to:

- An options object, providing a [config file](configuration.md) was found.
- `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

If `options.useCache` is `false`, all caching will be bypassed.

```js
const text = fs.readFileSync(filePath, "utf8");
prettier.resolveConfig(filePath).then((options) => {
  const formatted = prettier.format(text, options);
});
```

If `options.editorconfig` is `true` and an [`.editorconfig` file](https://editorconfig.org/) is in your project, Prettier will parse it and convert its properties to the corresponding prettier configuration. This configuration will be overridden by `.prettierrc`, etc. Currently, the following EditorConfig properties are supported:

- `end_of_line`
- `indent_style`
- `indent_size`/`tab_width`
- `max_line_length`

Use `prettier.resolveConfig.sync(filePath [, options])` if you'd like to use sync version.

## `prettier.resolveConfigFile([filePath])`

`resolveConfigFile` can be used to find the path of the Prettier configuration file that will be used when resolving the config (i.e. when calling `resolveConfig`). A promise is returned which will resolve to:

- The path of the configuration file.
- `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

The search starts at `process.cwd()`, or at `filePath` if provided. Please see the [cosmiconfig docs](https://github.com/davidtheclark/cosmiconfig#explorersearch) for details on how the resolving works.

```js
prettier.resolveConfigFile().then((filePath) => {
  prettier.resolveConfig(filePath).then((options) => {
    const formatted = prettier.format(text, options);
  });
});
```

Use `prettier.resolveConfigFile.sync([filePath])` if you'd like to use sync version.

## `prettier.clearConfigCache()`

When Prettier loads configuration files and plugins, the file system structure is cached for performance. This function will clear the cache. Generally this is only needed for editor integrations that know that the file system has changed since the last format took place.

## `prettier.getFileInfo(filePath [, options])`

`getFileInfo` can be used by editor extensions to decide if a particular file needs to be formatted. This method returns a promise, which resolves to an object with the following properties:

```typescript
{
  ignored: boolean,
  inferredParser: string | null,
}
```

The promise will be rejected if the type of `filePath` is not `string`.

Setting `options.ignorePath` (`string`) and `options.withNodeModules` (`boolean`) influence the value of `ignored` (`false` by default).

Providing [plugin](plugins.md) paths in `options.plugins` (`string[]`) helps extract `inferredParser` for files that are not supported by Prettier core.

When setting `options.resolveConfig` (`boolean`, default `false`), Prettier will resolve the configuration for the given `filePath`. This is useful, for example, when the `inferredParser` might be overridden for a subset of files.

Use `prettier.getFileInfo.sync(filePath [, options])` if you'd like to use sync version.

## `prettier.getSupportInfo()`

Returns an object representing the options, parsers, languages and file types Prettier supports.

The support information looks like this:

```typescript
{
  languages: Array<{
    name: string,
    since?: string,
    parsers: string[],
    group?: string,
    tmScope?: string,
    aceMode?: string,
    codemirrorMode?: string,
    codemirrorMimeType?: string,
    aliases?: string[],
    extensions?: string[],
    filenames?: string[],
    linguistLanguageId?: number,
    vscodeLanguageIds?: string[],
  }>
}
```

## Custom Parser API

If you need to make modifications to the AST (such as codemods), or you want to provide an alternate parser, you can do so by setting the `parser` option to a function. The function signature of the parser function is:

```js
(text: string, parsers: object, options: object) => AST;
```

Prettier's built-in parsers are exposed as properties on the `parsers` argument.

```js
prettier.format("lodash ( )", {
  parser(text, { babel }) {
    const ast = babel(text);
    ast.program.body[0].expression.callee.name = "_";
    return ast;
  },
});
// -> "_();\n"
```

The `--parser` CLI option may be a path to a node.js module exporting a parse function.
