# Prettier

[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/jlongster/prettier)
[![Build Status](https://travis-ci.org/prettier/prettier.svg?branch=master)](https://travis-ci.org/prettier/prettier)
[![Codecov](https://img.shields.io/codecov/c/github/prettier/prettier.svg)](https://codecov.io/gh/prettier/prettier)
[![NPM version](https://img.shields.io/npm/v/prettier.svg)](https://www.npmjs.com/package/prettier)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](#badge)

Prettier is an opinionated code formatter with support for:
* JavaScript, including [ES2017](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
* [JSX](https://facebook.github.io/jsx/)
* [Flow](https://flow.org/)
* [TypeScript](https://www.typescriptlang.org/)
* CSS, [Less](http://lesscss.org/), and [SCSS](http://sass-lang.com)
* [JSON](http://json.org/)
* [GraphQL](http://graphql.org/)

It removes all original styling[\*](#styling-footnote) and ensures that all outputted code
conforms to a consistent style. (See this [blog post](http://jlongster.com/A-Prettier-Formatter))

<details>
<summary><strong>Table of Contents</strong></summary>

<!-- Do not edit TOC, regenerate with `yarn toc` -->

<!-- toc -->

* [What does Prettier do?](#what-does-prettier-do)
* [Why Prettier?](#why-prettier)
  + [Building and enforcing a style guide](#building-and-enforcing-a-style-guide)
  + [Helping Newcomers](#helping-newcomers)
  + [Writing code](#writing-code)
  + [Easy to adopt](#easy-to-adopt)
  + [Clean up an existing codebase](#clean-up-an-existing-codebase)
  + [Ride the hype train](#ride-the-hype-train)
* [How does it compare to ESLint (or TSLint, stylelint...)?](#how-does-it-compare-to-eslint-or-tslint-stylelint)
* [Usage](#usage)
  + [CLI](#cli)
  + [ESLint](#eslint)
  + [Pre-commit Hook](#pre-commit-hook)
  + [API](#api)
  + [Excluding code from formatting](#excluding-code-from-formatting)
* [Options](#options)
  + [Print Width](#print-width)
  + [Tab Width](#tab-width)
  + [Tabs](#tabs)
  + [Semicolons](#semicolons)
  + [Quotes](#quotes)
  + [Trailing Commas](#trailing-commas)
  + [Bracket Spacing](#bracket-spacing)
  + [JSX Brackets](#jsx-brackets)
  + [Range](#range)
  + [Parser](#parser)
  + [Filepath](#filepath)
* [Configuration File](#configuration-file)
  + [Basic Configuration](#basic-configuration)
  + [Configuration Overrides](#configuration-overrides)
  + [Configuration Schema](#configuration-schema)
* [Editor Integration](#editor-integration)
  + [Atom](#atom)
  + [Emacs](#emacs)
  + [Vim](#vim)
  + [Visual Studio Code](#visual-studio-code)
  + [Visual Studio](#visual-studio)
  + [Sublime Text](#sublime-text)
  + [JetBrains WebStorm, PHPStorm, PyCharm...](#jetbrains-webstorm-phpstorm-pycharm)
* [Language Support](#language-support)
* [Related Projects](#related-projects)
* [Technical Details](#technical-details)
* [Badge](#badge)
* [Contributing](#contributing)

<!-- tocstop -->

</details>

--------------------------------------------------------------------------------

## What does Prettier do?

Prettier takes your code and reprints it from scratch by taking the line length into account.

For example, take the following code:

```js
foo(arg1, arg2, arg3, arg4);
```

It fits in a single line so it's going to stay as is. However, we've all run into this situation:

<!-- prettier-ignore -->
```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

Suddenly our previous format for calling function breaks down because this is too long. Prettier is going to do the painstaking work of reprinting it like that for you:

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

Prettier enforces a consistent code **style** (i.e. code formatting that won't affect the AST) across your entire codebase because it disregards the original styling[\*](#styling-footnote) by parsing it away and re-printing the parsed AST with its own rules that take the maximum line length
into account, wrapping code when necessary.

<a href="#styling-footnote" name="styling-footnote">\*</a>_Well actually, some
original styling is preserved when practical—see [empty lines] and [multi-line
objects]._

[empty lines]:Rationale.md#empty-lines
[multi-line objects]:Rationale.md#multi-line-objects

If you want to learn more, these two conference talks are great introductions:

<a href="https://www.youtube.com/watch?v=hkfBvpEfWdA"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886367/dda8a6f0-1e08-11e7-865b-22492450f10f.png"></a> <a href="https://www.youtube.com/watch?v=0Q4kUNx85_4"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886368/ddacd6f8-1e08-11e7-806a-9febd23cbf47.png"></a>


## Why Prettier?

### Building and enforcing a style guide

By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles. It is generally accepted that having a common style guide is valuable for a project and team but getting there is a very painful and unrewarding process. People get very emotional around particular ways of writing code and nobody likes spending time writing and receiving nits.
- “We want to free mental threads and end discussions around style. While sometimes fruitful, these discussions are for the most part wasteful.”
- “Literally had an engineer go through a huge effort of cleaning up all of our code because we were debating ternary style for the longest time and were inconsistent about it. It was dumb, but it was a weird on-going "great debate" that wasted lots of little back and forth bits. It's far easier for us all to agree now: just run Prettier, and go with that style.”
- “Getting tired telling people how to style their product code.”
- “Our top reason was to stop wasting our time debating style nits.”
- “Having a githook set up has reduced the amount of style issues in PRs that result in broken builds due to ESLint rules or things I have to nit-pick or clean up later.”
- “I don't want anybody to nitpick any other person ever again.”
- “It reminds me of how Steve Jobs used to wear the same clothes every day because he has a million decisions to make and he didn't want to be bothered to make trivial ones like picking out clothes. I think Prettier is like that.”

### Helping Newcomers

Prettier is usually introduced by people with experience in the current codebase and JavaScript but the people that disproportionally benefit from it are newcomers to the codebase. One may think that it's only useful for people with very limited programming experience, but we've seen it quicken the ramp up time from experienced engineers joining the company, as they likely used a different coding style before, and developers coming from a different programming language.
- “My motivations for using Prettier are: appearing that I know how to write JavaScript well.”
- “I always put spaces in the wrong place, now I don't have to worry about it anymore.”
- “When you're a beginner you're making a lot of mistakes caused by the syntax. Thanks to Prettier, you can reduce these mistakes and save a lot of time to focus on what really matters.”
- “As a teacher, I will also tell to my students to install Prettier to help them to learn the JS syntax and have readable files.”

### Writing code

What usually happens once people are using Prettier is that they realize that they actually spend a lot of time and mental energy formatting their code. With Prettier editor integration, you can just press that magic key binding and poof, the code is formatted. This is an eye opening experience if anything else.
- “I want to write code. Not spend cycles on formatting.”
- “It removed 5% that sucks in our daily life - aka formatting”
- “We're in 2017 and it's still painful to break a call into multiple lines when you happen to add an argument that makes it go over the 80 columns limit :(“

### Easy to adopt

We've worked very hard to use the least controversial coding styles, went through many rounds of fixing all the edge cases and polished the getting started experience. When you're ready to push Prettier into your codebase, not only should it be painless for you to do it technically but the newly formatted codebase should not generate major controversy and be accepted painlessly by your co-workers.
- “It's low overhead. We were able to throw Prettier at very different kinds of repos without much work.”
- “It's been mostly bug free. Had there been major styling issues during the course of implementation we would have been wary about throwing this at our JS codebase. I'm happy to say that's not the case.”
- “Everyone runs it as part of their pre commit scripts, a couple of us use the editor on save extensions as well.”
- “It's fast, against one of our larger JS codebases we were able to run Prettier in under 13 seconds.”
- “The biggest benefit for Prettier for us was being able to format the entire code base at once.”

### Clean up an existing codebase

Since coming up with a coding style and enforcing it is a big undertaking, it often slips through the cracks and you are left working on inconsistent codebases. Running Prettier in this case is a quick win, the codebase is now uniform and easier to read without spending hardly any time.
- “Take a look at the code :) I just need to restore sanity.”
- “We inherited a ~2000 module ES6 code base, developed by 20 different developers over 18 months, in a global team. Felt like such a win without much research.”

### Ride the hype train

Purely technical aspects of the projects aren't the only thing people look into when choosing to adopt Prettier. Who built and uses it and how quickly it spreads through the community has a non-trivial impact.
- “The amazing thing, for me, is: 1) Announced 2 months ago. 2) Already adopted by, it seems, every major JS project. 3) 7000 stars, 100,000 npm downloads/mo”
- “Was built by the same people as React & React Native.”
- “I like to be part of the hot new things.”
- “Because soon enough people are gonna ask for it.”

A few of the [many projects](https://www.npmjs.com/browse/depended/prettier) using Prettier:

<table>
<tr>
<td><p align="center"><a href="https://facebook.github.io/react/"><img src="website/static/images/react-200x100.png" alt="React" width="200" height="100"><br>React</a></p></td>
<td><p align="center"><a href="https://facebook.github.io/jest/"><img src="website/static/images/jest-200x100.png" alt="Jest" width="200" height="100"><br>Jest</a></p></td>
<td><p align="center"><a href="https://yarnpkg.com"><img src="website/static/images/yarn-200x100.png" alt="Yarn" width="200" height="100"><br>Yarn</a></p></td>
</tr>
<tr>
<td><p align="center"><a href="https://babeljs.io/"><img src="website/static/images/babel-200x100.png" alt="Babel" width="200" height="100"><br>Babel</a></p></td>
<td><p align="center"><a href="https://zeit.co/"><img src="website/static/images/zeit-200x100.png" alt="Zeit" width="200" height="100"><br>Zeit</a></p></td>
<td><p align="center"><a href="https://webpack.js.org/api/cli/"><img src="website/static/images/webpack-200x100.png" alt="Webpack-cli" width="200" height="100"><br>Webpack-cli</a></p></td>
</tr>
</table>


## How does it compare to ESLint (or TSLint, stylelint...)?

Linters have two categories of rules:

**Formatting rules**: eg: [max-len](http://eslint.org/docs/rules/max-len), [no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs), [keyword-spacing](http://eslint.org/docs/rules/keyword-spacing), [comma-style](http://eslint.org/docs/rules/comma-style)...

Prettier alleviates the need for this whole category of rules! Prettier is going to reprint the entire program from scratch in a consistent way, so it's not possible for the programmer to make a mistake there anymore :)

**Code-quality rules**: eg [no-unused-vars](http://eslint.org/docs/rules/no-unused-vars), [no-extra-bind](http://eslint.org/docs/rules/no-extra-bind), [no-implicit-globals](http://eslint.org/docs/rules/no-implicit-globals), [prefer-promise-reject-errors](http://eslint.org/docs/rules/prefer-promise-reject-errors)...

Prettier does nothing to help with those kind of rules. They are also the most important ones provided by linters as they are likely to catch real bugs with your code!


## Usage

Install:

```
yarn add prettier --dev --exact
```

You can install it globally if you like:

```
yarn global add prettier
```

*We're using `yarn` but you can use `npm` if you like:*

```
npm install --save-dev --save-exact prettier
# or globally
npm install --global prettier
```

> We recommend pinning an exact version of prettier in your `package.json`
> as we introduce stylistic changes in patch releases.

### CLI

Run Prettier through the CLI with this script. Run it without any
arguments to see the [options](#options).

To format a file in-place, use `--write`. You may want to consider
committing your code before doing that, just in case.

```bash
prettier [opts] [filename ...]
```

In practice, this may look something like:

```bash
prettier --single-quote --trailing-comma es5 --write "{app,__{tests,mocks}__}/**/*.js"
```

Don't forget the quotes around the globs! The quotes make sure that Prettier
expands the globs rather than your shell, for cross-platform usage.
The [glob syntax from the glob module](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer)
is used.

#### `--debug-check`

If you're worried that Prettier will change the correctness of your code, add `--debug-check` to the command.
This will cause Prettier to print an error message if it detects that code correctness might have changed.
Note that `--write` cannot be used with `--debug-check`.

#### `--find-config-path` and `--config`

If you are repeatedly formatting individual files with `prettier`, you will incur a small performance cost
when prettier attempts to look up a [configuration file](#configuration-file). In order to skip this, you may
ask prettier to find the config file once, and re-use it later on.

```bash
prettier --find-config-path ./my/file.js
./my/.prettierrc
```

This will provide you with a path to the configuration file, which you can pass to `--config`:

```bash
prettier --config ./my/.prettierrc --write ./my/file.js
```

You can also use `--config` if your configuration file lives somewhere where prettier cannot find it,
such as a `config/` directory.

If you don't have a configuration file, or want to ignore it if it does exist,
you can pass `--no-config` instead.

#### `--ignore-path`

Path to a file containing patterns that describe files to ignore.  By default, prettier looks for `./.prettierignore`.

#### `--require-pragma`

Require a special comment, called a pragma, to be present in the file's first docblock comment in order for prettier to format it.
```js
/**
 * @prettier
 */
```

Valid pragmas are `@prettier` and `@format`.

#### `--list-different`

Another useful flag is `--list-different` (or `-l`) which prints the filenames of files that are different from Prettier formatting. If there are differences the script errors out, which is useful in a CI scenario.

```bash
prettier --single-quote --list-different "src/**/*.js"
```

#### `--no-config`

Do not look for a configuration file.  The default settings will be used.

#### `--config-precedence`

Defines how config file should be evaluated in combination of CLI options.

**cli-override (default)**

CLI options take precedence over config file

**file-override**

Config file take precedence over CLI options

**prefer-file**

If a config file is found will evaluate it and ignore other CLI options. If no config file is found CLI options will evaluate as normal.

This option adds support to editor integrations where users define their default configuration but want to respect project specific configuration.

#### `--with-node-modules`

Prettier CLI will ignore files located in `node_modules` directory. To opt-out from this behavior use `--with-node-modules` flag.

#### `--write`

This rewrites all processed files in place.  This is comparable to the `eslint --fix` workflow.

### ESLint

If you are using ESLint, integrating Prettier to your workflow is straightforward:

Just add Prettier as an ESLint rule using [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier).

```js
yarn add --dev prettier eslint-plugin-prettier

// .eslintrc.json
{
  "plugins": [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

We also recommend that you use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to disable all the existing formatting rules. It's a one liner that can be added on-top of any existing ESLint configuration.

```
$ yarn add --dev eslint-config-prettier
```

.eslintrc.json:

```json
{
  "extends": [
    "prettier"
  ]
}
```


### Pre-commit Hook

You can use Prettier with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add` before you commit.

##### Option 1. [lint-staged](https://github.com/okonet/lint-staged)

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add lint-staged husky --dev
```

and add this config to your `package.json`:

```json
{
  "scripts": {
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,json,css}": [
      "prettier --write",
      "git add"
    ]
  }
}
```
There is a limitation where if you stage specific lines this approach will stage the whole file after regardless. See this [issue](https://github.com/okonet/lint-staged/issues/62) for more info.

See https://github.com/okonet/lint-staged#configuration for more details about how you can configure lint-staged.


##### Option 2. [pre-commit](https://github.com/pre-commit/pre-commit)

Copy the following config into your `.pre-commit-config.yaml` file:

```yaml

    -   repo: https://github.com/prettier/prettier
        sha: ''  # Use the sha or tag you want to point at
        hooks:
        -   id: prettier

```

Find more info from [here](https://pre-commit.com).

##### Option 3. bash script

Alternately you can save this script as `.git/hooks/pre-commit` and give it execute permission:

```bash
#!/bin/sh
jsfiles=$(git diff --cached --name-only --diff-filter=ACM | grep '\.jsx\?$' | tr '\n' ' ')
[ -z "$jsfiles" ] && exit 0

# Prettify all staged .js files
echo "$jsfiles" | xargs ./node_modules/.bin/prettier --write

# Add back the modified/prettified files to staging
echo "$jsfiles" | xargs git add

exit 0
```

### API

```js
const prettier = require("prettier");
```

#### `prettier.format(source [, options])`

`format` is used to format text using Prettier. [Options](#options) may be provided to override the defaults.

```js
prettier.format("foo ( );", { semi: false });
// -> "foo()"
```

#### `prettier.check(source [, options])`

`check` checks to see if the file has been formatted with Prettier given those options and returns a `Boolean`.
This is similar to the `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

#### `prettier.formatWithCursor(source [, options])`

`formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code.
This is useful for editor integrations, to prevent the cursor from moving when code is formatted.

The `cursorOffset` option should be provided, to specify where the cursor is. This option cannot be used with `rangeStart` and `rangeEnd`.

```js
prettier.formatWithCursor(" 1", { cursorOffset: 2 });
// -> { formatted: '1;\n', cursorOffset: 1 }
```

#### `prettier.resolveConfig([filePath [, options]])`

`resolveConfig` can be used to resolve configuration for a given source file.
The function optionally accepts an input file path as an argument, which defaults to the current working directory.
A promise is returned which will resolve to:
* An options object, providing a [config file](#configuration-file) was found.
* `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

If `options.useCache` is `false`, all caching will be bypassed.

```js
const text = fs.readFileSync(filePath, "utf8");
prettier.resolveConfig(filePath).then(options => {
  const formatted = prettier.format(text, options);
})
```

Use `prettier.resolveConfig.sync([filePath [, options]])` if you'd like to use sync version.

#### `prettier.clearConfigCache()`

As you repeatedly call `resolveConfig`, the file system structure will be cached for performance.
This function will clear the cache. Generally this is only needed for editor integrations that
know that the file system has changed since the last format took place.

#### Custom Parser API

If you need to make modifications to the AST (such as codemods), or you want to provide an alternate parser, you can do so by setting the `parser` option to a function. The function signature of the parser function is:
```js
(text: string, parsers: object, options: object) => AST;
```

Prettier's built-in parsers are exposed as properties on the `parsers` argument.

```js
prettier.format("lodash ( )", {
  parser(text, { babylon }) {
    const ast = babylon(text);
    ast.program.body[0].expression.callee.name = "_";
    return ast;
  }
});
// -> "_();\n"
```

The `--parser` CLI option may be a path to a node.js module exporting a parse function.

### Excluding code from formatting

A JavaScript comment of `// prettier-ignore` will exclude the next node in the abstract syntax tree from formatting.

For example:

```js
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)

// prettier-ignore
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)
```

will be transformed to:

```js
matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

// prettier-ignore
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)
```

## Options
Prettier ships with a handful of customizable format options, usable in both the CLI and API.

### Print Width
Specify the line length that the printer will wrap on.

> **For readability we recommend against using more than 80 characters:**
>
>In code styleguides, maximum line length rules are often set to 100 or 120. However, when humans write code, they don't strive to reach the maximum number of columns on every line. Developers often use whitespace to break up long lines for readability. In practice, the average line length often ends up well below the maximum.
>
> Prettier, on the other hand, strives to fit the most code into every line. With the print width set to 120, prettier may produce overly compact, or otherwise undesirable code.

Default | CLI Override | API Override
--------|--------------|-------------
`80` | `--print-width <int>` | `printWidth: <int>`

### Tab Width
Specify the number of spaces per indentation-level.

Default | CLI Override | API Override
--------|--------------|-------------
 `2` | `--tab-width <int>` | `tabWidth: <int>`

### Tabs
Indent lines with tabs instead of spaces

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`

### Semicolons
Print semicolons at the ends of statements.

Valid options:

 * `true` - Add a semicolon at the end of every statement.
 * `false` - Only add semicolons at the beginning of lines that may introduce ASI failures.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-semi` | `semi: <bool>`

### Quotes
Use single quotes instead of double quotes.

Notes:
* Quotes in JSX will always be double and ignore this setting.
* If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.

Default | CLI Override | API Override
--------|--------------|-------------
`false` |  `--single-quote` | `singleQuote: <bool>`

### Trailing Commas
Print trailing commas wherever possible when multi-line. (A single-line array,
for example, never gets trailing commas.)

Valid options:
 * `"none"` - No trailing commas.
 * `"es5"` - Trailing commas where valid in ES5 (objects, arrays, etc.)
 * `"all"` - Trailing commas wherever possible (including function arguments). This requires node 8 or a [transform](https://babeljs.io/docs/plugins/syntax-trailing-function-commas/).

Default | CLI Override | API Override
--------|--------------|-------------
`"none"` | <code>--trailing-comma <none&#124;es5&#124;all></code> | <code>trailingComma: "<none&#124;es5&#124;all>"</code>

### Bracket Spacing
Print spaces between brackets in object literals.

Valid options:
 * `true` - Example: `{ foo: bar }`.
 * `false` - Example: `{foo: bar}`.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-bracket-spacing` | `bracketSpacing: <bool>`

### JSX Brackets
Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--jsx-bracket-same-line` | `jsxBracketSameLine: <bool>`

### Range
Format only a segment of a file.

These two options can be used to format code starting and ending at a given character offset (inclusive and exclusive, respectively). The range will extend:
* Backwards to the start of the first line containing the selected statement.
* Forwards to the end of the selected statement.

These options cannot be used with `cursorOffset`.

Default | CLI Override | API Override
--------|--------------|-------------
`0`        | `--range-start <int>`| `rangeStart: <int>`
`Infinity` | `--range-end <int>`  | `rangeEnd: <int>`

### Parser
Specify which parser to use.

Both the `babylon` and `flow` parsers support the same set of JavaScript features (including Flow). Prettier automatically infers the parser from the input file path, so you shouldn't have to change this setting.

Built-in parsers:
 * [`babylon`](https://github.com/babel/babylon/)
 * [`flow`](https://github.com/facebook/flow/tree/master/src/parser)
 * [`typescript`](https://github.com/eslint/typescript-eslint-parser) _Since v1.4.0_
 * [`postcss`](https://github.com/postcss/postcss) _Since v1.4.0_
 * [`json`](https://github.com/babel/babylon/tree/f09eb3200f57ea94d51c2a5b1facf2149fb406bf#babylonparseexpressioncode-options) _Since v1.5.0_
 * [`graphql`](https://github.com/graphql/graphql-js/tree/master/src/language) _Since v1.5.0_

[Custom parsers](#custom-parser-api) are also supported.  _Since v1.5.0_

Default | CLI Override | API Override
--------|--------------|-------------
`babylon` | `--parser <string>`<br />`--parser ./my-parser` | `parser: "<string>"`<br />`parser: require("./my-parser")`

### Filepath
Specify the input filepath. This will be used to do parser inference.

For example, the following will use `postcss` parser:

```bash
cat foo | prettier --stdin-filepath foo.css
```

Default | CLI Override | API Override
--------|--------------|-------------
None | `--stdin-filepath <string>` | `filepath: "<string>"`

### Require pragma
Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file. This is very useful
when gradually transitioning large, unformatted codebases to prettier.

For example, a file with the following as its first comment will be formatted when `--require-pragma` is supplied:

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

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--require-pragma` | `requirePragma: <bool>`

## Configuration File

Prettier uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support.
This means you can configure prettier via:

* A `.prettierrc` file, written in YAML or JSON, with optional extensions: `.yaml/.yml/.json/.js`.
* A `prettier.config.js` file that exports an object.
* A `"prettier"` key in your `package.json` file.

The configuration file will be resolved starting from the location of the file being formatted,
and searching up the file tree until a config file is (or isn't) found.

The options to the configuration file are the same the [API options](#options).

### Basic Configuration

JSON:

```json
// .prettierrc
{
  "printWidth": 100,
  "parser": "flow"
}
```

YAML:

```yaml
# .prettierrc
printWidth: 100
parser: flow
```

### Configuration Overrides

Prettier borrows eslint's [override format](http://eslint.org/docs/user-guide/configuring#example-configuration).
This allows you to apply configuration to specific files.

JSON:

```json
{
  "semi": false,
  "overrides": [{
    "files": "*.test.js",
    "options": {
      "semi": true
    }
  }]
}
```

YAML:

```yaml
semi: false
overrides:
- files: "*.test.js"
  options:
    semi: true
```

`files` is required for each override, and may be a string or array of strings.
`excludeFiles` may be optionally provided to exclude files for a given rule, and may also be a string or array of strings.

To get prettier to format its own `.prettierrc` file, you can do:

```json
{
  "overrides": [{
    "files": ".prettierrc",
    "options": { "parser": "json" }
  }]
}
```

For more information on how to use the CLI to locate a file, see the [CLI](#cli) section.

### Configuration Schema

If you'd like a JSON schema to validate your configuration, one is available here: http://json.schemastore.org/prettierrc.

## Editor Integration

### Atom

Atom users can simply install the [prettier-atom](https://github.com/prettier/prettier-atom) package and use
`Ctrl+Alt+F` to format a file (or format on save if enabled).

### Emacs

Emacs users should see [this repository](https://github.com/prettier/prettier-emacs)
for on-demand formatting.

### Vim

Vim users can simply install either [sbdchd](https://github.com/sbdchd)/[neoformat](https://github.com/sbdchd/neoformat), [w0rp](https://github.com/w0rp)/[ale](https://github.com/w0rp/ale), or [prettier](https://github.com/prettier)/[vim-prettier](https://github.com/prettier/vim-prettier), for more details see [this directory](https://github.com/prettier/prettier/tree/master/editors/vim).

### Visual Studio Code

Can be installed using the extension sidebar. Search for `Prettier - JavaScript formatter`.

Can also be installed using `ext install prettier-vscode`.

[Check its repository for configuration and shortcuts](https://github.com/prettier/prettier-vscode)

### Visual Studio

Install the [JavaScript Prettier extension](https://github.com/madskristensen/JavaScriptPrettier).

### Sublime Text

Sublime Text support is available through Package Control and
the [JsPrettier](https://packagecontrol.io/packages/JsPrettier) plug-in.

### JetBrains WebStorm, PHPStorm, PyCharm...

See the [WebStorm
guide](https://github.com/jlongster/prettier/tree/master/editors/webstorm/README.md).

## Language Support

Prettier attempts to support all JavaScript language features,
including non-standardized ones. By default it uses the
[Babylon](https://github.com/babel/babylon) parser with all language
features enabled, but you can also use the
[Flow](https://github.com/facebook/flow) parser with the
`parser` API or `--parser` CLI [option](#options).

All of JSX and Flow syntax is supported. In fact, the test suite in
`tests/flow` *is* the entire Flow test suite and they all pass.

Prettier also supports [TypeScript](https://www.typescriptlang.org/), CSS, [Less](http://lesscss.org/), [SCSS](http://sass-lang.com), [JSON](http://json.org/), and [GraphQL](http://graphql.org/).

The minimum version of TypeScript supported is 2.1.3 as it introduces the ability to have leading `|` for type definitions which prettier outputs.

## Related Projects

- [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) plugs Prettier into your ESLint workflow
- [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) turns off all ESLint rules that are unnecessary or might conflict with Prettier
- [`prettier-eslint`](https://github.com/prettier/prettier-eslint)
passes `prettier` output to `eslint --fix`
- [`prettier-stylelint`](https://github.com/hugomrdias/prettier-stylelint)
passes `prettier` output to `stylelint --fix`
- [`prettier-standard`](https://github.com/sheerun/prettier-standard)
uses `prettier` and `prettier-eslint` to format code with standard rules
- [`prettier-standard-formatter`](https://github.com/dtinth/prettier-standard-formatter)
passes `prettier` output to `standard --fix`
- [`prettier-miscellaneous`](https://github.com/arijs/prettier-miscellaneous)
`prettier` with a few minor extra options
- [`neutrino-preset-prettier`](https://github.com/SpencerCDixon/neutrino-preset-prettier) allows you to use Prettier as a Neutrino preset
- [`prettier_d`](https://github.com/josephfrazier/prettier_d.js) runs Prettier as a server to avoid Node.js startup delay. It also supports configuration via `.prettierrc`, `package.json`, and `.editorconfig`.
- [`Prettier Bookmarklet`](https://prettier.glitch.me/) provides a bookmarklet and exposes a REST API for Prettier that allows to format CodeMirror editor in your browser
- [`prettier-github`](https://github.com/jgierer12/prettier-github) formats code in GitHub comments
- [`rollup-plugin-prettier`](https://github.com/mjeanroy/rollup-plugin-prettier) allows you to use Prettier with Rollup
- [`markdown-magic-prettier`](https://github.com/camacho/markdown-magic-prettier) allows you to use Prettier to format JS [codeblocks](https://help.github.com/articles/creating-and-highlighting-code-blocks/) in Markdown files via [Markdown Magic](https://github.com/DavidWells/markdown-magic)
- [`tslint-plugin-prettier`](https://github.com/ikatyang/tslint-plugin-prettier) runs Prettier as a TSLint rule and reports differences as individual TSLint issues
- [`tslint-config-prettier`](https://github.com/alexjoverm/tslint-config-prettier) use TSLint with Prettier without any conflict

## Technical Details

This printer is a fork of
[recast](https://github.com/benjamn/recast)'s printer with its
algorithm replaced by the one described by Wadler in "[A prettier
printer](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)".
There still may be leftover code from recast that needs to be cleaned
up.

The basic idea is that the printer takes an AST and returns an
intermediate representation of the output, and the printer uses that
to generate a string. The advantage is that the printer can "measure"
the IR and see if the output is going to fit on a line, and break if
not.

This means that most of the logic of printing an AST involves
generating an abstract representation of the output involving certain
commands. For example, `concat(["(", line, arg, line ")"])` would
represent a concatenation of opening parens, an argument, and closing
parens. But if that doesn't fit on one line, the printer can break
where `line` is specified.

More (rough) details can be found in [commands.md](commands.md).

## Badge

Show the world you're using *Prettier* → [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

```md
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
