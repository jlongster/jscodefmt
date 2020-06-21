---
id: version-stable-configuration
title: Configuration File
original_id: configuration
---

Prettier uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support. This means you can configure prettier via (in order of precedence):

- A `"prettier"` key in your `package.json` file.
- A `.prettierrc` file, written in JSON or YAML, with optional extensions: `.json/.yaml/.yml` (without extension takes precedence).
- A `.prettierrc.js` or `prettier.config.js` file that exports an object.
- A `.prettierrc.toml` file, written in TOML (the `.toml` extension is _required_).

The configuration file will be resolved starting from the location of the file being formatted, and searching up the file tree until a config file is (or isn't) found.

The options to the configuration file are the same as the [API options](options.md).

## Basic Configuration

JSON:

```json
{
  "trailingComma": "es5",
  "tabWidth": 4,
  "semi": false,
  "singleQuote": true
}
```

JS:

```js
// prettier.config.js or .prettierrc.js
module.exports = {
  trailingComma: "es5",
  tabWidth: 4,
  semi: false,
  singleQuote: true,
};
```

YAML:

```yaml
# .prettierrc or .prettierrc.yaml
trailingComma: "es5"
tabWidth: 4
semi: false
singleQuote: true
```

TOML:

```toml
# .prettierrc.toml
trailingComma = "es5"
tabWidth = 4
semi = false
singleQuote = true
```

## Configuration Overrides

Overrides let you have different configuration for certain file extensions, folders and specific files.

Prettier borrows ESLint’s [override format](https://eslint.org/docs/user-guide/configuring#example-configuration).

JSON:

```json
{
  "semi": false,
  "overrides": [
    {
      "files": "*.test.js",
      "options": {
        "semi": true
      }
    },
    {
      "files": ["*.html", "legacy/**/*.js"],
      "options": {
        "tabWidth": 4
      }
    }
  ]
}
```

YAML:

```yaml
semi: false
overrides:
  - files: "*.test.js"
    options:
      semi: true
  - files:
      - "*.html"
      - "legacy/**/*.js"
    options:
      tabWidth: 4
```

`files` is required for each override, and may be a string or array of strings. `excludeFiles` may be optionally provided to exclude files for a given rule, and may also be a string or array of strings.

## Sharing configurations

Sharing a Prettier configuration is simple: just publish a module that exports a configuration object, say `@company/prettier-config`, and reference it in your `package.json`:

```json
{
  "name": "my-cool-library",
  "version": "9000.0.1",
  "prettier": "@company/prettier-config"
}
```

If you don't want to use `package.json`, you can use any of the supported extensions to export a string, e.g. `.prettierrc.json`:

```json
"@company/prettier-config"
```

An example configuration repository is available [here](https://github.com/azz/prettier-config).

> Note: This method does **not** offer a way to _extend_ the configuration to overwrite some properties from the shared configuration. If you need to do that, import the file in a `.prettierrc.js` file and export the modifications, e.g:
>
> ```js
> module.exports = {
>   ...require("@company/prettier-config"),
>   semi: false,
> };
> ```

## Setting the [parser](options.md#parser) option

By default, Prettier automatically infers which parser to use based on the input file extension. Combined with `overrides` you can teach Prettier how to parse files it does not recognize.

For example, to get Prettier to format its own `.prettierrc` file, you can do:

```json
{
  "overrides": [
    {
      "files": ".prettierrc",
      "options": { "parser": "json" }
    }
  ]
}
```

You can also switch to the `flow` parser instead of the default `babel` for .js files:

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": {
        "parser": "flow"
      }
    }
  ]
}
```

**Note:** _Never_ put the `parser` option at the top level of your configuration. _Only_ use it inside `overrides`. Otherwise you effectively disable Prettier's automatic file extension based parser inference. This forces Prettier to use the parser you specified for _all_ types of files – even when it doesn't make sense, such as trying to parse a CSS file as JavaScript.

## Configuration Schema

If you'd like a JSON schema to validate your configuration, one is available here: http://json.schemastore.org/prettierrc.
