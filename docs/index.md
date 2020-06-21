---
id: index
title: What is Prettier?
---

Prettier is an opinionated code formatter with support for:

- JavaScript, including [ES2017](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
- [JSX](https://facebook.github.io/jsx/)
- [Angular](https://angular.io/)
- [Vue](https://vuejs.org/)
- [Flow](https://flow.org/)
- [TypeScript](https://www.typescriptlang.org/)
- CSS, [Less](http://lesscss.org/), and [SCSS](https://sass-lang.com)
- [HTML](https://en.wikipedia.org/wiki/HTML)
- [JSON](https://json.org/)
- [GraphQL](https://graphql.org/)
- [Markdown](https://commonmark.org/), including [GFM](https://github.github.com/gfm/) and [MDX](https://mdxjs.com/)
- [YAML](https://yaml.org/)

It removes all original styling[\*](#footnotes) and ensures that all outputted code conforms to a consistent style. (See this [blog post](https://jlongster.com/A-Prettier-Formatter))

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

Prettier enforces a consistent code **style** (i.e. code formatting that won't affect the AST) across your entire codebase because it disregards the original styling[\*](#footnotes) by parsing it away and re-printing the parsed AST with its own rules that take the maximum line length into account, wrapping code when necessary.

If you want to learn more, these two conference talks are great introductions:

[![A Prettier Printer by James Long on React Conf 2017](/docs/assets/youtube-cover/a-prettier-printer-by-james-long-on-react-conf-2017.png)](https://www.youtube.com/watch?v=hkfBvpEfWdA)

[![JavaScript Code Formatting by Christopher Chedeau on React London 2017](/docs/assets/youtube-cover/javascript-code-formatting-by-christopher-chedeau-on-react-london-2017.png)](https://www.youtube.com/watch?v=0Q4kUNx85_4)

#### Footnotes

\* _Well actually, some original styling is preserved when practical—see [empty lines](rationale.md#empty-lines) and [multi-line objects](rationale.md#multi-line-objects)._
