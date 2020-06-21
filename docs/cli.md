---
id: cli
title: CLI
---

Use the `prettier` command to run Prettier from the command line. Run it without any arguments to see the [options](options.md).

To format a file in-place, use `--write`. You may want to consider committing your code before doing that, just in case.

```bash
prettier [options] [file/dir/glob ...]
```

In practice, this may look something like:

```bash
prettier --write .
```

This command formats all files supported by Prettier in the current directory and its subdirectories.

A more complicated example:

```bash
prettier --single-quote --trailing-comma all --write docs package.json "{app,__{tests,mocks}__}/**/*.js"
```

> Don't forget the **quotes** around the globs! The quotes make sure that Prettier CLI expands the globs rather than your shell, which is important for cross-platform usage.

> It's usually better to use a [configuration file](configuration.md) for formatting options like `--single-quote` and `--trailing-comma` instead of passing them as CLI flags. This allows sharing those settings across different ways to run Prettier (CLI, [editor integrations](editors.md), etc.).

Given a list of paths/patterns, Prettier CLI first treats every entry in it as a literal path.

- If the path points to an existing file, Prettier CLI proceeds with that file and doesn't resolve the path as a glob pattern.

- If the path points to an existing directory, Prettier CLI recursively finds supported files in that directory. This resolution process is based on file extensions and well-known file names that Prettier and its [plugins](plugins.md) associate with supported languages.

- Otherwise, the entry is resolved as a glob pattern using the [glob syntax from the `fast-glob` module](https://github.com/mrmlnc/fast-glob#pattern-syntax).

Prettier CLI will ignore files located in `node_modules` directory. To opt out from this behavior use `--with-node-modules` flag.

To escape special characters in globs, one of the two escaping syntaxes can be used: `prettier "\[my-dir]/*.js"` or `prettier "[[]my-dir]/*.js"`. Both match all JS files in a directory named `[my-dir]`, however the latter syntax is preferable as the former doesn't work on Windows, where backslashes are treated as path separators.

## `--check`

When you want to check if your files are formatted, you can run Prettier with the `--check` flag (or `-c`).
This will output a human-friendly message and a list of unformatted files, if any.

```bash
prettier --check "src/**/*.js"
```

Console output if all files are formatted:

```console
Checking formatting...
All matched files use Prettier code style!
```

Console output if some of the files require re-formatting:

```console
Checking formatting...
src/fileA.js
src/fileB.js
Code style issues found in the above file(s). Forgot to run Prettier?
```

The command will return exit code 1 in the second case, which is helpful inside the CI pipelines.
Human-friendly status messages help project contributors react on possible problems.
To minimise the number of times `prettier --check` finds unformatted files, you may be interested in configuring a [pre-commit hook](precommit.md) in your repo.
Applying this practice will minimise the number of times the CI fails because of code formatting problems.

If you need to pipe the list of unformatted files to another command, you can use [`--list-different`](cli.md#--list-different) flag instead of `--check`.

### Exit codes

| Code | Information                         |
| ---- | ----------------------------------- |
| 0    | Everything formatted properly       |
| 1    | Something wasn't formatted properly |
| 2    | Something's wrong with Prettier     |

## `--debug-check`

If you're worried that Prettier will change the correctness of your code, add `--debug-check` to the command. This will cause Prettier to print an error message if it detects that code correctness might have changed. Note that `--write` cannot be used with `--debug-check`.

## `--find-config-path` and `--config`

If you are repeatedly formatting individual files with `prettier`, you will incur a small performance cost when prettier attempts to look up a [configuration file](configuration.md). In order to skip this, you may ask prettier to find the config file once, and re-use it later on.

```bash
prettier --find-config-path ./my/file.js
./my/.prettierrc
```

This will provide you with a path to the configuration file, which you can pass to `--config`:

```bash
prettier --config ./my/.prettierrc --write ./my/file.js
```

You can also use `--config` if your configuration file lives somewhere where prettier cannot find it, such as a `config/` directory.

If you don't have a configuration file, or want to ignore it if it does exist, you can pass `--no-config` instead.

## `--ignore-path`

Path to a file containing patterns that describe files to ignore. By default, prettier looks for `./.prettierignore`.

## `--require-pragma`

Require a special comment, called a pragma, to be present in the file's first docblock comment in order for prettier to format it.

```js
/**
 * @prettier
 */
```

Valid pragmas are `@prettier` and `@format`.

## `--insert-pragma`

Insert a `@format` pragma to the top of formatted files when pragma is absent. Works well when used in tandem with `--require-pragma`.

## `--list-different`

Another useful flag is `--list-different` (or `-l`) which prints the filenames of files that are different from Prettier formatting. If there are differences the script errors out, which is useful in a CI scenario.

```bash
prettier --single-quote --list-different "src/**/*.js"
```

You can also use [`--check`](cli.md#--check) flag, which works the same way as `--list-different`, but also prints a human-friendly summary message to stdout.

## `--no-config`

Do not look for a configuration file. The default settings will be used.

## `--config-precedence`

Defines how config file should be evaluated in combination of CLI options.

**cli-override (default)**

CLI options take precedence over config file

**file-override**

Config file take precedence over CLI options

**prefer-file**

If a config file is found will evaluate it and ignore other CLI options. If no config file is found CLI options will evaluate as normal.

This option adds support to editor integrations where users define their default configuration but want to respect project specific configuration.

## `--no-editorconfig`

Don't take .editorconfig into account when parsing configuration. See the [`prettier.resolveConfig` docs](api.md) for details.

## `--with-node-modules`

Prettier CLI will ignore files located in `node_modules` directory. To opt-out from this behavior use `--with-node-modules` flag.

## `--write`

This rewrites all processed files in place. This is comparable to the `eslint --fix` workflow.

## `--loglevel`

Change the level of logging for the CLI. Valid options are:

- `error`
- `warn`
- `log` (default)
- `debug`
- `silent`

## `--stdin-filepath`

A path to the file that the Prettier CLI will treat like stdin. For example:

_abc.css_

```css
.name {
  display: none;
}
```

_shell_

```console
$ cat abc.css | prettier --stdin-filepath abc.css
.name {
  display: none;
}
```
