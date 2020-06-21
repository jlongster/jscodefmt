The core of the algorithm is implemented in `doc-{printer,builders,utils,debug}.js`. The printer should use the basic formatting abstractions provided to construct a format when printing a node. Parts of the API only exist to be compatible with recast's previous API to ease migration, but over time we can clean it up.

The following commands are available:

### concat

```ts
declare function concat(docs: Doc[]): Doc;
```

Combine an array into a single string.

### group

```ts
type GroupOpts = {
  shouldBreak?: boolean;
  expandedStates?: Doc[];
};
declare function group(doc: Doc, opts?: GroupOpts): Doc;
```

Mark a group of items which the printer should try to fit on one line. This is the basic command to tell the printer when to break. Groups are usually nested, and the printer will try to fit everything on one line, but if it doesn't fit it will break the outermost group first and try again. It will continue breaking groups until everything fits (or there are no more groups to break).

A document can force parent groups to break by including `breakParent` (see below). A hard and literal line automatically include this so they always break parent groups. Breaks are propagated to all parent groups, so if a deeply nested expression has a hard break, everything will break. This only matters for "hard" breaks, i.e. newlines that are printed no matter what and can be statically analyzed.

For example, an array will try to fit on one line:

```js
[1, "foo", { bar: 2 }];
```

However, if any of the items inside the array have a hard break, the array will _always_ break as well:

```js
[
  1,
  function () {
    return 2;
  },
  3,
];
```

Functions always break after the opening curly brace no matter what, so the array breaks as well for consistent formatting. See the implementation of `ArrayExpression` for an example.

### conditionalGroup

This should be used as **last resort** as it triggers an exponential complexity when nested.

```ts
type ConditionalGroupOpts = {
  shouldBreak?: boolean;
};
declare function conditionalGroup(
  alternatives: Doc[],
  opts?: ConditionalGroupOpts
): Doc;
```

This will try to print the first argument, if it fit use it, otherwise go to the next one and so on.

```js
conditionalGroup([a, b, c]);
```

### fill

```ts
declare function fill(docs: Doc[]): Doc;
```

This is an alternative type of group which behaves like text layout: it's going to add a break whenever the next element doesn't fit in the line anymore. The difference with a typical group is that it's not going to break all the separators, just the ones that are at the end of lines.

```js
fill(["I", line, "love", line, "prettier"]);
```

### ifBreak

```ts
declare function ifBreak(ifBreak: Doc, noBreak: Doc): Doc;
```

Prints something if the current group breaks and something else if it doesn't.

```js
ifBreak(";", " ");
```

### breakParent

```ts
declare var breakParent: Doc;
```

Include this anywhere to force all parent groups to break. See `group` for more info. Example:

```js
group(concat([" ", expr, " ", breakParent]));
```

### join

```ts
declare function join(sep: Doc, docs: Doc[]): Doc;
```

Join an array of items with a separator.

### line

```ts
declare var line: Doc;
```

Specify a line break. If an expression fits on one line, the line break will be replaced with a space. Line breaks always indent the next line with the current level of indentation.

### softline

```ts
declare var softline: Doc;
```

Specify a line break. The difference from `line` is that if the expression fits on one line, it will be replaced with nothing.

### hardline

```ts
declare var hardline: Doc;
```

Specify a line break that is **always** included in the output, no matter if the expression fits on one line or not.

### literalline

```ts
declare var literalline: Doc;
```

Specify a line break that is **always** included in the output, and don't indent the next line. This is used for template literals.

### lineSuffix

```ts
declare function lineSuffix(suffix: Doc): Doc;
```

This is used to implement trailing comments. In practice, it is not practical to find where the line ends and you don't want to accidentally print some code at the end of the comment. `lineSuffix` will buffer the output and flush it before any new line.

```js
concat(["a", lineSuffix(" // comment"), ";", hardline]);
```

will output

```js
a; // comment
```

### lineSuffixBoundary

```ts
declare var lineSuffixBoundary: Doc;
```

In cases where you embed code inside of templates, comments shouldn't be able to leave the code part. lineSuffixBoundary is an explicit marker you can use to flush code in addition to newlines.

```js
concat(["{", lineSuffix(" // comment"), lineSuffixBoundary, "}", hardline]);
```

will output

<!-- prettier-ignore -->
```js
{ // comment
}
```

and **not**

<!-- prettier-ignore -->
```js
{} // comment
```

### indent

```ts
declare function indent(doc: Doc): Doc;
```

Increase the level of indentation.

### dedent

```ts
declare function dedent(doc: Doc): Doc;
```

Decrease the level of indentation. (Each `align` is considered one level of indentation.)

### align

```ts
declare function align(n: number | string, doc: Doc): Doc;
```

This is similar to indent but it increases the level of indentation by a fixed number or a string.
Trailing alignments in indentation are still spaces, but middle ones are transformed into one tab per `align` when `useTabs` enabled.
If it's using in a whitespace-sensitive language, e.g. markdown, you should use `n` with string value to force print it.

For example:

- `useTabs`
  - `tabWidth: 2`
    - `<indent><align 2><indent><align 2>` -> `<tab><tab><tab><2 space>`
    - `<indent><align 4><indent><align 2>` -> `<tab><tab><tab><2 space>`
  - `tabWidth: 4`
    - `<indent><align 2><indent><align 2>` -> `<tab><tab><tab><2 space>`
    - `<indent><align 4><indent><align 2>` -> `<tab><tab><tab><2 space>`

### markAsRoot

```ts
declare function markAsRoot(doc: Doc): Doc;
```

This marks the current indentation as root for `dedentToRoot` and `literalline`s.

### dedentToRoot

```ts
declare function dedentToRoot(doc: Doc): Doc;
```

This will dedent the current indentation to the root marked by `markAsRoot`.

### trim

```ts
declare var trim: Doc;
```

This will trim any whitespace or tab character on the current line. This is used for preprocessor directives.

### cursor

```ts
declare var cursor: Doc;
```

This is a placeholder value where the cursor is in the original input in order to find where it would be printed.

## Example

For an example, here's the implementation of the `ArrayExpression` node type:

<!-- prettier-ignore -->
```js
group(
  concat([
    "[",
    indent(
      concat([
        line,
        join(
          concat([",", line]),
          path.map(print, "elements")
        )
      ])
    ),
    line,
    "]"
  ])
);
```

This is a group with opening and closing brackets, and possibly indented contents. Because it's a `group` it will always be broken up if any of the sub-expressions are broken.
