---
id: options
title: Options
---

Prettier ships with a handful of format options.

**To learn more about Prettier’s stance on options – see the [Option Philosophy](option-philosophy.md).**

If you change any options, it’s recommended to do it via a [configuration file](configuration.md). This way the Prettier CLI, [editor integrations](editors.md) and other tooling knows what options you use.

## Print Width

Specify the line length that the printer will wrap on.

> **For readability we recommend against using more than 80 characters:**
>
> In code styleguides, maximum line length rules are often set to 100 or 120. However, when humans write code, they don’t strive to reach the maximum number of columns on every line. Developers often use whitespace to break up long lines for readability. In practice, the average line length often ends up well below the maximum.
>
> Prettier’s printWidth option does not work the same way. It is not the hard upper allowed line length limit. It is a way to say to Prettier roughly how long you’d like lines to be. Prettier will make both shorter and longer lines, but generally strive to meet the specified printWidth.
>
> Remember, computers are dumb. You need to explicitly tell them what to do, while humans can make their own (implicit) judgements, for example on when to break a line.
>
> In other words, don’t try to use printWidth as if it was ESLint’s [max-len](https://eslint.org/docs/rules/max-len) – they’re not the same. max-len just says what the maximum allowed line length is, but not what the generally preferred length is – which is what printWidth specifies.

| Default | CLI Override          | API Override        |
| ------- | --------------------- | ------------------- |
| `80`    | `--print-width <int>` | `printWidth: <int>` |

(If you don’t want line wrapping when formatting Markdown, you can set the [Prose Wrap](#prose-wrap) option to disable it.)

## Tab Width

Specify the number of spaces per indentation-level.

| Default | CLI Override        | API Override      |
| ------- | ------------------- | ----------------- |
| `2`     | `--tab-width <int>` | `tabWidth: <int>` |

## Tabs

Indent lines with tabs instead of spaces.

| Default | CLI Override | API Override      |
| ------- | ------------ | ----------------- |
| `false` | `--use-tabs` | `useTabs: <bool>` |

(Tabs will be used for _indentation_ but Prettier uses spaces to _align_ things, such as in ternaries.)

## Semicolons

Print semicolons at the ends of statements.

Valid options:

- `true` - Add a semicolon at the end of every statement.
- `false` - Only add semicolons at the beginning of lines that [may introduce ASI failures](rationale.md#semicolons).

| Default | CLI Override | API Override   |
| ------- | ------------ | -------------- |
| `true`  | `--no-semi`  | `semi: <bool>` |

## Quotes

Use single quotes instead of double quotes.

Notes:

- JSX quotes ignore this option – see [jsx-single-quote](#jsx-quotes).
- If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.

See the [strings rationale](rationale.md#strings) for more information.

| Default | CLI Override     | API Override          |
| ------- | ---------------- | --------------------- |
| `false` | `--single-quote` | `singleQuote: <bool>` |

## Quote Props

Change when properties in objects are quoted.

Valid options:

- `"as-needed"` - Only add quotes around object properties where required.
- `"consistent"` - If at least one property in an object requires quotes, quote all properties.
- `"preserve"` - Respect the input use of quotes in object properties.

| Default       | CLI Override                                                         | API Override                                                         |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `"as-needed"` | <code>--quote-props <as-needed&#124;consistent&#124;preserve></code> | <code>quoteProps: "<as-needed&#124;consistent&#124;preserve>"</code> |

Note that Prettier never unquotes numeric property names in Angular expressions, TypeScript, and Flow because the distinction between string and numeric keys is significant in these languages. See: [Angular][quote-props-angular], [TypeScript][quote-props-typescript], [Flow][quote-props-flow]. Also Prettier doesn’t unquote numeric properties for Vue (see the [issue][quote-props-vue] about that).

[quote-props-angular]: https://codesandbox.io/s/hungry-morse-foj87?file=/src/app/app.component.html
[quote-props-typescript]: https://www.typescriptlang.org/play?#code/DYUwLgBAhhC8EG8IEYBcKA0EBM7sQF8AoUSAIzkQgHJlr1ktrt6dCiiATEAY2CgBOICKWhR0AaxABPAPYAzCGGkAHEAugBuLr35CR4CGTKSZG5Wo1ltRKDHjHtQA
[quote-props-flow]: https://flow.org/try/#0PQKgBAAgZgNg9gdzCYAoVBjOA7AzgFzAA8wBeMAb1TDAAYAuMARlQF8g
[quote-props-vue]: https://github.com/prettier/prettier/issues/10127

If this option is set to `preserve`, `singleQuote` to `false` (default value), and `parser` to `json5`, double quotes are always used for strings. This effectively allows using the `json5` parser for “JSON with comments and trailing commas”.

## JSX Quotes

Use single quotes instead of double quotes in JSX.

| Default | CLI Override         | API Override             |
| ------- | -------------------- | ------------------------ |
| `false` | `--jsx-single-quote` | `jsxSingleQuote: <bool>` |

## Trailing Commas

_Default value changed from `none` to `es5` in v2.0.0_

Print trailing commas wherever possible in multi-line comma-separated syntactic structures. (A single-line array, for example, never gets trailing commas.)

Valid options:

- `"es5"` - Trailing commas where valid in ES5 (objects, arrays, etc.). No trailing commas in type parameters in TypeScript.
- `"none"` - No trailing commas.
- `"all"` - Trailing commas wherever possible (including [function parameters and calls](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas#Trailing_commas_in_functions)). To run, JavaScript code formatted this way needs an engine that supports ES2017 (Node.js 8+ or a modern browser) or [downlevel compilation](https://babeljs.io/docs/en/index). This also enables trailing commas in type parameters in TypeScript (supported since TypeScript 2.7 released in January 2018).

| Default | CLI Override                                           | API Override                                           |
| ------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `"es5"` | <code>--trailing-comma <es5&#124;none&#124;all></code> | <code>trailingComma: "<es5&#124;none&#124;all>"</code> |

## Bracket Spacing

Print spaces between brackets in object literals.

Valid options:

- `true` - Example: `{ foo: bar }`.
- `false` - Example: `{foo: bar}`.

| Default | CLI Override           | API Override             |
| ------- | ---------------------- | ------------------------ |
| `true`  | `--no-bracket-spacing` | `bracketSpacing: <bool>` |

## Angle Brackets

Put the `>` of a multi-line HTML-like (HTML, JSX, etc.) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).

Valid options:

- `true` - Example:

<!-- prettier-ignore -->
```html
<button
  className="prettier-class"
  id="prettier-id"
  onClick={this.handleClick}>
  Click Here
</button>
```

- `false` - Example:

<!-- prettier-ignore -->
```html
<button
  className="prettier-class"
  id="prettier-id"
  onClick={this.handleClick}
>
  Click Here
</button>
```

| Default | CLI Override                | API Override                   |
| ------- | --------------------------- | ------------------------------ |
| `false` | `--angle-bracket-same-line` | `angleBracketSameLine: <bool>` |

## Arrow Function Parentheses

_First available in v1.9.0, default value changed from `avoid` to `always` in v2.0.0_

Include parentheses around a sole arrow function parameter.

Valid options:

- `"always"` - Always include parens. Example: `(x) => x`
- `"avoid"` - Omit parens when possible. Example: `x => x`

| Default    | CLI Override                                    | API Override                                    |
| ---------- | ----------------------------------------------- | ----------------------------------------------- |
| `"always"` | <code>--arrow-parens <always&#124;avoid></code> | <code>arrowParens: "<always&#124;avoid>"</code> |

At first glance, avoiding parentheses may look like a better choice because of less visual noise.
However, when Prettier removes parentheses, it becomes harder to add type annotations, extra arguments or default values as well as making other changes.
Consistent use of parentheses provides a better developer experience when editing real codebases, which justifies the default value for the option.

## Range

Format only a segment of a file.

These two options can be used to format code starting and ending at a given character offset (inclusive and exclusive, respectively). The range will extend:

- Backwards to the start of the first line containing the selected statement.
- Forwards to the end of the selected statement.

These options cannot be used with `cursorOffset`.

| Default    | CLI Override          | API Override        |
| ---------- | --------------------- | ------------------- |
| `0`        | `--range-start <int>` | `rangeStart: <int>` |
| `Infinity` | `--range-end <int>`   | `rangeEnd: <int>`   |

## Parser

Specify which parser to use.

Prettier automatically infers the parser from the input file path, so you shouldn’t have to change this setting.

Both the `babel` and `flow` parsers support the same set of JavaScript features (including Flow type annotations). They might differ in some edge cases, so if you run into one of those you can try `flow` instead of `babel`. Almost the same applies to `typescript` and `babel-ts`. `babel-ts` might support JavaScript features (proposals) not yet supported by TypeScript, but it’s less permissive when it comes to invalid code and less battle-tested than the `typescript` parser.

Valid options:

- `"babel"` (via [@babel/parser](https://github.com/babel/babel/tree/main/packages/babel-parser)) _Named `"babylon"` until v1.16.0_
- `"babel-flow"` (same as `"babel"` but enables Flow parsing explicitly to avoid ambiguity) _First available in v1.16.0_
- `"babel-ts"` (similar to `"typescript"` but uses Babel and its TypeScript plugin) _First available in v2.0.0_
- `"flow"` (via [flow-parser](https://github.com/facebook/flow/tree/master/src/parser))
- `"typescript"` (via [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint)) _First available in v1.4.0_
- `"espree"` (via [espree](https://github.com/eslint/espree)) _First available in v2.2.0_
- `"meriyah"` (via [meriyah](https://github.com/meriyah/meriyah)) _First available in v2.2.0_
- `"css"` (via [postcss-scss](https://github.com/postcss/postcss-scss) and [postcss-less](https://github.com/shellscape/postcss-less), autodetects which to use) _First available in v1.7.1_
- `"scss"` (same parsers as `"css"`, prefers postcss-scss) _First available in v1.7.1_
- `"less"` (same parsers as `"css"`, prefers postcss-less) _First available in v1.7.1_
- `"json"` (via [@babel/parser parseExpression](https://babeljs.io/docs/en/next/babel-parser.html#babelparserparseexpressioncode-options)) _First available in v1.5.0_
- `"json5"` (same parser as `"json"`, but outputs as [json5](https://json5.org/)) _First available in v1.13.0_
- `"json-stringify"` (same parser as `"json"`, but outputs like `JSON.stringify`) _First available in v1.13.0_
- `"graphql"` (via [graphql/language](https://github.com/graphql/graphql-js/tree/master/src/language)) _First available in v1.5.0_
- `"markdown"` (via [remark-parse](https://github.com/wooorm/remark/tree/main/packages/remark-parse)) _First available in v1.8.0_
- `"mdx"` (via [remark-parse](https://github.com/wooorm/remark/tree/main/packages/remark-parse) and [@mdx-js/mdx](https://github.com/mdx-js/mdx/tree/master/packages/mdx)) _First available in v1.15.0_
- `"html"` (via [angular-html-parser](https://github.com/ikatyang/angular-html-parser/tree/master/packages/angular-html-parser)) _First available in 1.15.0_
- `"vue"` (same parser as `"html"`, but also formats vue-specific syntax) _First available in 1.10.0_
- `"angular"` (same parser as `"html"`, but also formats angular-specific syntax via [angular-estree-parser](https://github.com/ikatyang/angular-estree-parser)) _First available in 1.15.0_
- `"lwc"` (same parser as `"html"`, but also formats LWC-specific syntax for unquoted template attributes) _First available in 1.17.0_
- `"yaml"` (via [yaml](https://github.com/eemeli/yaml) and [yaml-unist-parser](https://github.com/ikatyang/yaml-unist-parser)) _First available in 1.14.0_

[Custom parsers](api.md#custom-parser-api) are also supported. _First available in v1.5.0_

| Default | CLI Override                                    | API Override                                               |
| ------- | ----------------------------------------------- | ---------------------------------------------------------- |
| None    | `--parser <string>`<br />`--parser ./my-parser` | `parser: "<string>"`<br />`parser: require("./my-parser")` |

Note: the default value was `"babylon"` until v1.13.0.

<a name="filepath"></a>

## File Path

Specify the file name to use to infer which parser to use.

For example, the following will use the CSS parser:

```bash
cat foo | prettier --stdin-filepath foo.css
```

This option is only useful in the CLI and API. It doesn’t make sense to use it in a configuration file.

| Default | CLI Override                | API Override           |
| ------- | --------------------------- | ---------------------- |
| None    | `--stdin-filepath <string>` | `filepath: "<string>"` |

## Require Pragma

_First available in v1.7.0_

Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file. This is very useful when gradually transitioning large, unformatted codebases to Prettier.

A file with the following as its first comment will be formatted when `--require-pragma` is supplied:

```js
/**
 * @prettier
 */
```

or

```js
/**
 * @format
 */
```

| Default | CLI Override       | API Override            |
| ------- | ------------------ | ----------------------- |
| `false` | `--require-pragma` | `requirePragma: <bool>` |

## Insert Pragma

_First available in v1.8.0_

Prettier can insert a special `@format` marker at the top of files specifying that the file has been formatted with Prettier. This works well when used in tandem with the `--require-pragma` option. If there is already a docblock at the top of the file then this option will add a newline to it with the `@format` marker.

Note that “in tandem” doesn’t mean “at the same time”. When the two options are used simultaneously, `--require-pragma` has priority, so `--insert-pragma` is ignored. The idea is that during an incremental adoption of Prettier in a big codebase, the developers participating in the transition process use `--insert-pragma` whereas `--require-pragma` is used by the rest of the team and automated tooling to process only files already transitioned. The feature has been inspired by Facebook’s [adoption strategy].

| Default | CLI Override      | API Override           |
| ------- | ----------------- | ---------------------- |
| `false` | `--insert-pragma` | `insertPragma: <bool>` |

[adoption strategy]: https://prettier.io/blog/2017/05/03/1.3.0.html#facebook-adoption-update

## Prose Wrap

_First available in v1.8.2_

By default, Prettier will wrap markdown text as-is since some services use a linebreak-sensitive renderer, e.g. GitHub comment and BitBucket. In some cases you may want to rely on editor/viewer soft wrapping instead, so this option allows you to opt out with `"never"`.

Valid options:

- `"always"` - Wrap prose if it exceeds the print width.
- `"never"` - Do not wrap prose.
- `"preserve"` - Wrap prose as-is. _First available in v1.9.0_

| Default      | CLI Override                                                | API Override                                                |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `"preserve"` | <code>--prose-wrap <always&#124;never&#124;preserve></code> | <code>proseWrap: "<always&#124;never&#124;preserve>"</code> |

## HTML Whitespace Sensitivity

_First available in v1.15.0. First available for Handlebars in 2.3.0_

Specify the global whitespace sensitivity for HTML, Vue, Angular, and Handlebars. See [whitespace-sensitive formatting] for more info.

[whitespace-sensitive formatting]: https://prettier.io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting

Valid options:

- `"css"` - Respect the default value of CSS `display` property. For Handlebars treated same as `strict`.
- `"strict"` - Whitespace (or the lack of it) around all tags is considered significant.
- `"ignore"` - Whitespace (or the lack of it) around all tags is considered insignificant.

| Default | CLI Override                                                             | API Override                                                            |
| ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `"css"` | <code>--html-whitespace-sensitivity <css&#124;strict&#124;ignore></code> | <code>htmlWhitespaceSensitivity: "<css&#124;strict&#124;ignore>"</code> |

## Vue files script and style tags indentation

_First available in v1.19.0_

Whether or not to indent the code inside `<script>` and `<style>` tags in Vue files. Some people (like [the creator of Vue](https://github.com/prettier/prettier/issues/3888#issuecomment-459521863)) don’t indent to save an indentation level, but this might break code folding in your editor.

Valid options:

- `"false"` - Do not indent script and style tags in Vue files.
- `"true"` - Indent script and style tags in Vue files.

| Default | CLI Override                    | API Override                      |
| ------- | ------------------------------- | --------------------------------- |
| `false` | `--vue-indent-script-and-style` | `vueIndentScriptAndStyle: <bool>` |

## End of Line

_First available in v1.15.0, default value changed from `auto` to `lf` in v2.0.0_

For historical reasons, there exist two common flavors of line endings in text files.
That is `\n` (or `LF` for _Line Feed_) and `\r\n` (or `CRLF` for _Carriage Return + Line Feed_).
The former is common on Linux and macOS, while the latter is prevalent on Windows.
Some details explaining why it is so [can be found on Wikipedia](https://en.wikipedia.org/wiki/Newline).

When people collaborate on a project from different operating systems, it becomes easy to end up with mixed line endings in a shared git repository.
It is also possible for Windows users to accidentally change line endings in a previously committed file from `LF` to `CRLF`.
Doing so produces a large `git diff` and thus makes the line-by-line history for a file (`git blame`) harder to explore.

If you want to make sure that your entire git repository only contains Linux-style line endings in files covered by Prettier:

1. Ensure Prettier’s `endOfLine` option is set to `lf` (this is a default value since v2.0.0)
1. Configure [a pre-commit hook](precommit.md) that will run Prettier
1. Configure Prettier to run in your CI pipeline using [`--check` flag](cli.md#--check). If you use Travis CI, set [the `autocrlf` option](https://docs.travis-ci.com/user/customizing-the-build#git-end-of-line-conversion-control) to `input` in `.travis.yml`.
1. Add `* text=auto eol=lf` to the repo’s `.gitattributes` file.
   You may need to ask Windows users to re-clone your repo after this change to ensure git has not converted `LF` to `CRLF` on checkout.

All modern text editors in all operating systems are able to correctly display line endings when `\n` (`LF`) is used.
However, old versions of Notepad for Windows will visually squash such lines into one as they can only deal with `\r\n` (`CRLF`).

Valid options:

- `"lf"` – Line Feed only (`\n`), common on Linux and macOS as well as inside git repos
- `"crlf"` - Carriage Return + Line Feed characters (`\r\n`), common on Windows
- `"cr"` - Carriage Return character only (`\r`), used very rarely
- `"auto"` - Maintain existing line endings
  (mixed values within one file are normalised by looking at what’s used after the first line)

| Default | CLI Override                                                | API Override                                               |
| ------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `"lf"`  | <code>--end-of-line <lf&#124;crlf&#124;cr&#124;auto></code> | <code>endOfLine: "<lf&#124;crlf&#124;cr&#124;auto>"</code> |

## Embedded Language Formatting

_First available in v2.1.0_

Control whether Prettier formats quoted code embedded in the file.

When Prettier identifies cases where it looks like you've placed some code it knows how to format within a string in another file, like in a tagged template in JavaScript with a tag named `html` or in code blocks in Markdown, it will by default try to format that code.

Sometimes this behavior is undesirable, particularly in cases where you might not have intended the string to be interpreted as code. This option allows you to switch between the default behavior (`auto`) and disabling this feature entirely (`off`).

Valid options:

- `"auto"` – Format embedded code if Prettier can automatically identify it.
- `"off"` - Never automatically format embedded code.

| Default  | CLI Override                         | API Override                        |
| -------- | ------------------------------------ | ----------------------------------- |
| `"auto"` | `--embedded-language-formatting=off` | `embeddedLanguageFormatting: "off"` |
