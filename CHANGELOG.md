# 2.0.5

[diff](https://github.com/prettier/prettier/compare/2.0.4...2.0.5)

#### Less: Fix formatting of `:extend` ([#7984](https://github.com/prettier/prettier/pull/7984) by [@fisker](https://github.com/fisker))

<!-- prettier-ignore -->
```less
// Input
.class {
  &:extend(.some-class .some-other-class .some-very-loooooooooooooong-class all);
}

// Prettier 2.0.4
.class {
  &:extend(
    .some-class .some-other-class .some-very-loooooooooooooong-class all
  );
}

// Prettier 2.0.4 (Second format)
.class {
  &: extend(
    .some-class .some-other-class .some-very-loooooooooooooong-class all
  );
}

// Prettier 2.0.5
.class {
  &:extend(
    .some-class .some-other-class .some-very-loooooooooooooong-class all
  );
}
```

#### Editor integration: Use [`resolve`](https://www.npmjs.com/package/resolve) if builtin `require.resolve` is overridden ([#8072](https://github.com/prettier/prettier/pull/8072) by [@fisker](https://github.com/fisker))

This fixes issues that the users of Atom and WebStorm faced with 2.0.4.

Prettier now switches to using the `resolve` module for resolving configuration files and plugins if it detects that `require.resolve` isn't Node's builtin function (doesn't support the second argument), which happens in environments like editor extensions. To force the fallback, set the `PRETTIER_FALLBACK_RESOLVE` environment variable to `true`.

# 2.0.4

[diff](https://github.com/prettier/prettier/compare/2.0.3...2.0.4)

#### Revert [#7869](https://github.com/prettier/prettier/pull/7869), "[TypeScript] format TSAsExpression with same logic as BinaryExpression" ([#7958](https://github.com/prettier/prettier/pull/7958))

# 2.0.3

[diff](https://github.com/prettier/prettier/compare/2.0.2...2.0.3)

### JavaScript

#### Fix `prettier-ignore` inside JSX ([#7877](https://github.com/prettier/prettier/pull/7877) by [@fisker](https://github.com/fisker))

<!-- prettier-ignore -->
```jsx
// Input
<div>
{
  /* prettier-ignore */
  x     ?   <Y/> : <Z/>
}
</div>;

// Prettier 2.0.2 (first output)
<div>
  {/* prettier-ignore */
  x     ?   <Y/> : <Z/>}
</div>;

// Prettier 2.0.2 (second output)
<div>{/* prettier-ignore */ x     ?   <Y/> : <Z/>}</div>;

// Prettier 2.0.3
<div>
  {
    /* prettier-ignore */
    x     ?   <Y/> : <Z/>
  }
</div>;
```

#### Fix regressions in styled-components template literals ([#7883](https://github.com/prettier/prettier/pull/7883) by [@thorn0](https://github.com/thorn0))

<!-- prettier-ignore -->
```js
// Input
const Icon = styled.div`
  background:   var(--${background});
  ${Link}:not(:first-child) {
      fill:    rebeccapurple;
  }
`;

// Prettier 2.0.2
const Icon = styled.div`
  background: var(-- ${background});
  ${Link}:not (:first-child) {
    fill: rebeccapurple;
  }
`;

// Prettier 2.0.3
const Icon = styled.div`
  background: var(--${background});
  ${Link}:not(:first-child) {
    fill: rebeccapurple;
  }
`;
```

#### Fix: line endings were not always converted properly in multiline strings and comments ([#7891](https://github.com/prettier/prettier/pull/7891) by [@sidharthv96](https://github.com/sidharthv96))

<!-- prettier-ignore -->
```
// Input
export const IAmIncredibleLongFunctionName = IAmAnotherFunctionName(<CRLF>
  (_0: IAmIncredibleLongParameterType) => {<CRLF>
    setTimeout(() => {<CRLF>
      /*<CRLF>
        Multiline comment<CRLF>
        Multiline comment<CRLF>
        Multiline comment<CRLF>
      */<CRLF>
      console.log(<CRLF>
        "Multiline string\<CRLF>
         Multiline string\<CRLF>
         Multiline string"<CRLF>
      );<CRLF>
    });<CRLF>
  }<CRLF>
);<CRLF>

// Prettier 2.0.2
export const IAmIncredibleLongFunctionName = IAmAnotherFunctionName(<CRLF>
  (_0: IAmIncredibleLongParameterType) => {<CRLF>
    setTimeout(() => {<CRLF>
      /*<LF>
        Multiline comment<LF>
        Multiline comment<LF>
        Multiline comment<LF>
      */<CRLF>
      console.log(<CRLF>
        "Multiline string\<LF>
         Multiline string\<LF>
         Multiline string"<CRLF>
      );<CRLF>
    });<CRLF>
  }<CRLF>
);<CRLF>

// Prettier 2.0.3: same as input
```

#### Fix bug with holes in array literals ([#7911](https://github.com/prettier/prettier/pull/7911) by [@bakkot](https://github.com/bakkot))

<!-- prettier-ignore -->
```jsx
// Input
new Test()
  .test()
  .test([, 0])
  .test();

// Prettier 2.0.2
[error] in.js: TypeError: Cannot read property 'type' of null

// Prettier 2.0.3
new Test().test().test([, 0]).test();
```

### TypeScript

#### Wrap TSAsExpression ([#7869](https://github.com/prettier/prettier/pull/7869) by [@sosukesuzuki](https://github.com/sosukesuzuki))

<!-- prettier-ignore -->
```ts
// Input
const value = thisIsAnIdentifier as ThisIsAReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyLongInterface;

// Prettier 2.0.2
const value = thisIsAnIdentifier as ThisIsAReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyLongInterface;

// Prettier 2.0.3
const value =
  thisIsAnIdentifier as
  ThisIsAReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyLongInterface;
```

### Flow

#### Print dangling comments for inexact object type ([#7892](https://github.com/prettier/prettier/pull/7892) by [@sosukesuzuki](https://github.com/sosukesuzuki))

<!-- prettier-ignore -->
```js
// Input
type Foo = {
  // comment
  ...,
};

// Prettier 2.0.2
Error: Comment "comment" was not printed. Please report this error!

// Prettier 2.0.3
type Foo = {
  // comment
  ...,
};
```

#### Do not add comma for explicit inexact object with indexer property or no properties ([#7923](https://github.com/prettier/prettier/pull/7923) by [@DmitryGonchar](https://github.com/DmitryGonchar))

<!-- prettier-ignore -->
```jsx
// Input
type T = {
  [string]: number,
  ...,
}

type T = {
  // comment
  ...,
}

// Prettier 2.0.2
type T = {
  [string]: number,
  ...,
}

type T = {
  // comment
  ...,
}

// Prettier 2.0.3
type T = {
  [string]: number,
  ...
}

type T = {
  // comment
  ...
}
```

### HTML

#### Fix printing of ignored empty inline elements ([#7867](https://github.com/prettier/prettier/pull/7867) by [@fisker](https://github.com/fisker))

<!-- prettier-ignore -->
```html
<!-- Input-->
<!--prettier-ignore--><span></span>
<!--prettier-ignore--><span>_</span>

<!-- Prettier 2.0.2 (first output) -->
<!--prettier-ignore--><span
></span>
<!--prettier-ignore--><span>_</span>

<!-- Prettier 2.0.2 (second output) -->
<!--prettier-ignore--><span

></span>
<!--prettier-ignore--><span>_</span>

<!-- Prettier 2.0.3 -->
<!--prettier-ignore--><span></span>
<!--prettier-ignore--><span>_</span>
```

#### Format `script` and `style` inside tags with a colon in the name ([#7916](https://github.com/prettier/prettier/pull/7916) by [@fisker](https://github.com/fisker))

<!-- prettier-ignore -->
```html
<!-- Input -->
<with:colon>
<script>function foo(){      return 1}</script>
<style>a         {color:         #f00}</style>
</with:colon>

<!-- Prettier 2.0.2 -->
<with:colon>
  <script>
    function foo(){ return 1}
  </script>
  <style>
    a {color: #f00}
  </style>
</with:colon>

<!-- Prettier 2.0.3 -->
<with:colon>
  <script>
    function foo() {
      return 1;
    }
  </script>
  <style>
    a {
      color: #f00;
    }
  </style>
</with:colon>
```

### Other changes

- Workaround for `require.resolve` in prettier-vscode ([#7951](https://github.com/prettier/prettier/pull/7951) by [@thorn0](https://github.com/thorn0))
- Fix unstable Angular expression binding ([#7924](https://github.com/prettier/prettier/pull/7924) by [@fisker](https://github.com/fisker))
- Update `isSCSS` regex ([#7922](https://github.com/prettier/prettier/pull/7922) by [@fisker](https://github.com/fisker))
- Fix formatting of empty files ([#7921](https://github.com/prettier/prettier/pull/7921) by [@fisker](https://github.com/fisker))

# 2.0.2

[diff](https://github.com/prettier/prettier/compare/2.0.1...2.0.2)

### 2.0 regressions

#### JavaScript: Fix formatting of pseudo-elements and pseudo-classes in styled-components template literals ([#7842](https://github.com/prettier/prettier/pull/7842) by [@thorn0](https://github.com/thorn0))

<!-- prettier-ignore -->
```jsx
// Input
const Foo = styled.div`
  ${media.smallDown}::before {}
`;

// Prettier 2.0.0
const Foo = styled.div`
  ${media.smallDown}: : before{
  }
`;

// Prettier 2.0.2
const Foo = styled.div`
  ${media.smallDown}::before {
  }
`;
```

#### TypeScript: Avoid trailing commas on index signatures with only one parameter ([#7836](https://github.com/prettier/prettier/pull/7836) by [@bakkot](https://github.com/bakkot))

TypeScript index signatures technically allow multiple parameters and trailing commas, but it's an error to have multiple parameters there, and Babel's TypeScript parser does not accept them. So Prettier now avoids putting a trailing comma there when you have only one parameter.

<!-- prettier-ignore -->
```ts
// Input
export type A = {
  a?: {
    [
      x: string
    ]: typeof SomeLongLongLongTypeName[keyof typeof SomeLongLongLongTypeName];
  } | null;
};

// Prettier 2.0.0
export type A = {
  a?: {
    [
      x: string,
    ]: typeof SomeLongLongLongTypeName[keyof typeof SomeLongLongLongTypeName];
  } | null;
};

// Prettier 2.0.2
export type A = {
  a?: {
    [
      x: string
    ]: typeof SomeLongLongLongTypeName[keyof typeof SomeLongLongLongTypeName];
  } | null;
};
```

#### Revert "markdown: fix redundant leading spaces in markdown list" ([#7847](https://github.com/prettier/prettier/pull/7847))

See [#7846](https://github.com/prettier/prettier/issues/7846)

### Other changes

#### TypeScript: Fix `prettier-ignore` in union types ([#7798](https://github.com/prettier/prettier/pull/7798) by [@thorn0](https://github.com/thorn0))

<!-- prettier-ignore -->
```ts
// Input
export type a =
  // foo
  | foo1&foo2
  // prettier-ignore
  | bar1&bar2
  // baz
  | baz1&baz2;

// Prettier 2.0.0
export type a =
  // foo
  | foo1&foo2
    // prettier-ignore
  // prettier-ignore
  | (bar1 & bar2)
  // baz
  | (baz1 & baz2);

// Prettier 2.0.2
export type a =
  // foo
  | (foo1 & foo2)
  // prettier-ignore
  | bar1&bar2
  // baz
  | (baz1 & baz2);
```

# 2.0.1

[diff](https://github.com/prettier/prettier/compare/2.0.0...2.0.1)

#### API: Fix build script to not corrupt `import-fresh` module ([#7820](https://github.com/prettier/prettier/pull/7820) by [@thorn0](https://github.com/thorn0))

# 2.0.0

[diff](https://github.com/prettier/prettier/compare/1.19.1...2.0.0)

🔗 [Release Notes](https://prettier.io/blog/2020/03/21/2.0.0.html)

# 1.19.1

[diff](https://github.com/prettier/prettier/compare/1.19.0...1.19.1)

### CLI

#### Fix `--stdin` regression in 1.19.0 ([#6894](https://github.com/prettier/prettier/pull/6894) by [@lydell](https://github.com/lydell))

<!-- prettier-ignore -->
```
// Prettier stable
$ echo "test" | prettier --stdin --parser babel
[error] regeneratorRuntime is not defined

// Prettier master
$ echo "test" | prettier --stdin --parser babel
test;
```

### TypeScript

#### Fix formatting of union type as arrow function return type ([#6896](https://github.com/prettier/prettier/pull/6896) by [@thorn0](https://github.com/thorn0))

<!-- prettier-ignore -->
```jsx
// Input
export const getVehicleDescriptor = async (
  vehicleId: string,
): Promise<Collections.Parts.PrintedCircuitBoardAssembly['attributes'] | undefined> => {}

// Prettier stable
export const getVehicleDescriptor = async (
  vehicleId: string
): Promise<| Collections.Parts.PrintedCircuitBoardAssembly["attributes"]
| undefined> => {};

// Prettier master
export const getVehicleDescriptor = async (
  vehicleId: string
): Promise<
  Collections.Parts.PrintedCircuitBoardAssembly["attributes"] | undefined
> => {};
```

# 1.19.0

[diff](https://github.com/prettier/prettier/compare/1.18.2...1.19.0)

🔗 [Release Notes](https://prettier.io/blog/2019/11/09/1.19.0.html)

# 1.18.2

[diff](https://github.com/prettier/prettier/compare/1.18.1...1.18.2)

- TypeScript: only add trailing commas in tuples for `--trailing-comma=all` ([#6199] by [@duailibe])

  In Prettier 1.18 we added trailing commas in tuples when `--trailing-comma=all`, but it was also adding for `--trailing-comma=es5`.

  [#6199]: https://github.com/prettier/prettier/pull/6199
  [@duailibe]: https://github.com/duailibe

# 1.18.1

[diff](https://github.com/prettier/prettier/compare/1.18.0...1.18.1)

- TypeScript: Add trailing comma in tsx, only for arrow function ([#6190] by [@sosukesuzuki])

  Prettier inserts a trailing comma to single type parameter for arrow functions in tsx, since v 1.18. But, this feature inserts a trailing comma to type parameter for besides arrow functions too (e.g, function , interface). This change fix it.

  <!-- prettier-ignore -->
  ```tsx
  // Input
  interface Interface1<T> {
    one: "one";
  }
  function function1<T>() {
    return "one";
  }

  // Output (Prettier 1.18.0)
  interface Interface1<T,> {
    one: "one";
  }
  function function1<T,>() {
    return "one";
  }

  // Output (Prettier 1.18.1)
  interface Interface1<T> {
    one: "one";
  }
  function function1<T>() {
    return "one";
  }
  ```

- Config: Match dotfiles in config overrides ([#6194] by [@duailibe])

  When using [`overrides`](https://prettier.io/docs/en/configuration.html#configuration-overrides) in the config file, Prettier was not matching dotfiles (files that start with `.`). This was fixed in 1.18.1

[#6190]: https://github.com/prettier/prettier/pull/6190
[#6194]: https://github.com/prettier/prettier/pull/6194
[@duailibe]: https://github.com/duailibe
[@sosukesuzuki]: https://github.com/sosukesuzuki

# 1.18.0

[diff](https://github.com/prettier/prettier/compare/1.17.1...1.18.0)

🔗 [Release Notes](https://prettier.io/blog/2019/06/06/1.18.0.html)

# 1.17.1

[diff](https://github.com/prettier/prettier/compare/1.17.0...1.17.1)

- Range: Fix ranged formatting not using the correct line width ([#6050] by [@mathieulj])

  <!-- prettier-ignore -->
  ```js
  // Input
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }

  // Output (Prettier 1.17.0 run with --range-start 30 --range-end 110)
  function f() {
    if (true) {
      call(
        "this line is 79 chars",
        "long",
        "it should",
        "stay as single line"
      );
    }
  }

  // Output (Prettier 1.17.0 run without range)
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }

  // Output (Prettier 1.17.1 with and without range)
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }
  ```

- JavaScript: Fix closure compiler typecasts ([#5947] by [@jridgewell])

  If a closing parenthesis follows after a typecast in an inner expression, the typecast would wrap everything to the that following parenthesis.

  <!-- prettier-ignore -->
  ```js
  // Input
  test(/** @type {!Array} */(arrOrString).length);
  test(/** @type {!Array} */((arrOrString)).length + 1);

  // Output (Prettier 1.17.0)
  test(/** @type {!Array} */ (arrOrString.length));
  test(/** @type {!Array} */ (arrOrString.length + 1));

  // Output (Prettier 1.17.1)
  test(/** @type {!Array} */ (arrOrString).length);
  test(/** @type {!Array} */ (arrOrString).length + 1);
  ```

- JavaScript: respect parenthesis around optional chaining before await ([#6087] by [@evilebottnawi])

  <!-- prettier-ignore -->
  ```js
  // Input
  async function myFunction() {
    var x = (await foo.bar.blah)?.hi;
  }

  // Output (Prettier 1.17.0)
  async function myFunction() {
    var x = await foo.bar.blah?.hi;
  }

  // Output (Prettier 1.17.1)
  async function myFunction() {
    var x = (await foo.bar.blah)?.hi;
  }
  ```

- Handlebars: Fix {{else}}{{#if}} into {{else if}} merging ([#6080] by [@dcyriller])

  <!-- prettier-ignore -->
  ```
  // Input
  {{#if a}}
    a
  {{else}}
    {{#if c}}
      c
    {{/if}}
    e
  {{/if}}

  // Output (Prettier 1.17.0)
  {{#if a}}
    a
  {{else if c}}
    c
  e
  {{/if}}

  // Output (Prettier 1.17.1)
  Code Sample
  {{#if a}}
    a
  {{else}}
    {{#if c}}
      c
    {{/if}}
    e
  {{/if}}
  ```

- JavaScript: Improved multiline closure compiler typecast comment detection ([#6070] by [@yangsu])

  Previously, multiline closure compiler typecast comments with lines that
  start with \* weren't flagged correctly and the subsequent parenthesis were
  stripped. Prettier 1.17.1 fixes this issue.

  <!-- prettier-ignore -->
  ```js
  // Input
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */({
    width,
  });

  // Output (Prettier 1.17.0)
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */ {
    width,
  };

  // Output (Prettier 1.17.1)
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */({
    width,
  });
  ```

[@mathieulj]: https://github.com/mathieulj
[@yangsu]: https://github.com/yangsu
[@dcyriller]: https://github.com/dcyriller
[@jridgewell]: https://github.com/jridgewell
[@evilebottnawi]: https://github.com/evilebottnawi
[#6050]: https://github.com/prettier/prettier/pull/6050
[#6070]: https://github.com/prettier/prettier/pull/6070
[#6080]: https://github.com/prettier/prettier/pull/6080
[#6087]: https://github.com/prettier/prettier/pull/6087

# 1.17.0

[diff](https://github.com/prettier/prettier/compare/1.16.2...1.17.0)

🔗 [Release Notes](https://prettier.io/blog/2019/04/12/1.17.0.html)

# 1.16.4

[diff](https://github.com/prettier/prettier/compare/1.16.3...1.16.4)

- API: Fix `prettier.getSupportInfo()` reporting babel parser for older versions of Prettier. ([#5826] by [@azz])

  In version `1.16.0` of Prettier, the `babylon` parser was renamed to `babel`. Unfortunately this lead to a minor breaking change: `prettier.getSupportInfo('1.15.0')` would report that it supported `babel`, not `babylon`, which breaks text-editor integrations. This has now been fixed.

[@azz]: https://github.com/azz
[#5826]: https://github.com/prettier/prettier/pull/5826

# 1.16.3

[diff](https://github.com/prettier/prettier/compare/1.16.2...1.16.3)

- TypeScript: Revert "Update typescript-estree to new package name" ([#5818] by [@ikatyang])

  There's an internal change introduced in Prettier 1.16.2,
  which updated `typescript-estree` to its new package name,
  but unfortunately it broke the output
  so we reverted it as a temporary workaround for now.

  <!-- prettier-ignore -->
  ```ts
  // Input
  export default {
    load<K, T>(k: K, t: T) {
      return {k, t};
    }
  }

  // Output (Prettier 1.16.2)
  export default {
    load(k: K, t: T) {
      return { k, t };
    }
  };

  // Output (Prettier 1.16.3)
  export default {
    load<K, T>(k: K, t: T) {
      return { k, t };
    }
  };
  ```

[@ikatyang]: https://github.com/ikatyang
[#5818]: https://github.com/prettier/prettier/pull/5818

# 1.16.2

[diff](https://github.com/prettier/prettier/compare/1.16.1...1.16.2)

- CLI: Fix CI detection to avoid unwanted TTY behavior ([#5804] by [@kachkaev])

  In Prettier 1.16.0 and 1.16.1, `--list-different` and `--check` logged every file in some CI environments, instead of just unformatted files.
  This unwanted behavior is now fixed.

- HTML: Do not format non-normal whitespace as normal whitespace ([#5797] by [@ikatyang])

  Previously, only non-breaking whitespaces (U+00A0) are marked as non-normal whitespace,
  which means other non-normal whitespaces such as non-breaking narrow whitespaces (U+202F)
  could be formatted as normal whitespaces, which breaks the output. We now follow the spec to
  exclude all non-[ASCII whitespace](https://infra.spec.whatwg.org/#ascii-whitespace) from whitespace normalization.

  (`·` represents a non-breaking narrow whitespace)

  <!-- prettier-ignore -->
  ```html
  <!-- Input -->
  Prix·:·32·€

  <!-- Output (Prettier 1.16.1) -->
  Prix : 32 €

  <!-- Output (Prettier 1.16.2) -->
  Prix·:·32·€
  ```

- JavaScript: Fix record type cast comment detection ([#5793] by [@yangsu])

  Previously, type cast comments with record types were ignored and prettier
  stripped the subsequent parens. Prettier 1.16.2 handles these cases correctly.

  <!-- prettier-ignore -->
  ```js
  // Input
  const v = /** @type {{key: number}} */ (value);

  // Output (Prettier 1.16.1)
  const v = /** @type {{key: number}} */ value;

  // Output (Prettier 1.16.2)
  const v = /** @type {{key: number}} */ (value);
  ```

[@ikatyang]: https://github.com/ikatyang
[@kachkaev]: https://github.com/kachkaev
[@yangsu]: https://github.com/yangsu
[#5793]: https://github.com/prettier/prettier/pull/5793
[#5797]: https://github.com/prettier/prettier/pull/5797
[#5804]: https://github.com/prettier/prettier/pull/5804

# 1.16.1

[diff](https://github.com/prettier/prettier/compare/1.16.0...1.16.1)

- JavaScript: Do not format functions with arguments as react hooks ([#5778] by [@SimenB])

  The formatting added in Prettier 1.16 would format any function receiving an
  arrow function and an array literal to match React Hook's documentation.
  Prettier will now format this the same as before that change if the arrow
  function receives any arguments.

  <!-- prettier-ignore -->
  ```js
  // Input
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce(
    (allColors, color) => {
      return allColors.concat(color);
    },
    []
  );

  // Output (Prettier 1.16.0)
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce((
    allColors,
    color
  ) => {
    return allColors.concat(color);
  }, []);

  // Output (Prettier 1.16.1)
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce(
    (allColors, color) => {
      return allColors.concat(color);
    },
    []
  );
  ```

- JavaScript: Add necessary parentheses for decorators ([#5785] by [@ikatyang])

  Parentheses for decorators with nested call expressions are optional for legacy decorators
  but they're required for decorators in the current [proposal](https://tc39.github.io/proposal-decorators/#sec-syntax).

  <!-- prettier-ignore -->
  ```js
  // Input
  class X {
    @(computed().volatile())
    prop
  }

  // Output (Prettier 1.16.0)
  class X {
    @computed().volatile()
    prop
  }

  // Output (Prettier 1.16.1)
  class X {
    @(computed().volatile())
    prop
  }
  ```

- TypeScript: Stable parentheses for function type in the return type of arrow function ([#5790] by [@ikatyang])

  There's a regression introduced in 1.16 that
  parentheses for function type in the return type of arrow function were kept adding/removing.
  Their parentheses are always printed now.

  <!-- prettier-ignore -->
  ```ts
  // Input
  const foo = (): (() => void) => (): void => null;
  const bar = (): () => void => (): void => null;

  // First Output (Prettier 1.16.0)
  const foo = (): () => void => (): void => null;
  const bar = (): (() => void) => (): void => null;

  // Second Output (Prettier 1.16.0)
  const foo = (): (() => void) => (): void => null;
  const bar = (): () => void => (): void => null;

  // Output (Prettier 1.16.1)
  const foo = (): (() => void) => (): void => null;
  const bar = (): (() => void) => (): void => null;
  ```

- MDX: Correctly recognize inline JSX ([#5783] by [@ikatyang])

  Previously, some inline JSXs are wrongly recognized as block HTML/JSX,
  which causes unexpected behaviors. This issue is now fixed.

  <!-- prettier-ignore -->
  ```md
  <!-- Input -->
  _foo <InlineJSX /> bar_

  <!-- Output (Prettier 1.16.0) -->
  _foo

  <InlineJSX /> bar_

  <!-- Output (Prettier 1.16.1) -->
  _foo <InlineJSX /> bar_
  ```

[@ikatyang]: https://github.com/ikatyang
[@simenb]: https://github.com/SimenB
[#5778]: https://github.com/prettier/prettier/pull/5778
[#5783]: https://github.com/prettier/prettier/pull/5783
[#5785]: https://github.com/prettier/prettier/pull/5785
[#5790]: https://github.com/prettier/prettier/pull/5790

# 1.16.0

[diff](https://github.com/prettier/prettier/compare/1.15.3...1.16.0)

🔗 [Release Notes](https://prettier.io/blog/2019/01/20/1.16.0.html)

# 1.15.3

[diff](https://github.com/prettier/prettier/compare/1.15.2...1.15.3)

- JavaScript: support `htm` ([#5565](https://github.com/prettier/prettier/pull/5565))
- JavaScript: support logical assignment operator ([#5489](https://github.com/prettier/prettier/pull/5489))
- JavaScript: do not add quotes for interpolation-only attributes in `html` templates ([#5544](https://github.com/prettier/prettier/pull/5544))
- JavaScript: add missing parenthesis for binary in optional member ([#5543](https://github.com/prettier/prettier/pull/5543))
- JavaScript: fix a parser regression ([#5530](https://github.com/prettier/prettier/pull/5530))
- JavaScript: improve union types with leading comments ([#5575](https://github.com/prettier/prettier/pull/5575))
- TypeScript: support BigInt ([#5546](https://github.com/prettier/prettier/pull/5546), [#5577](https://github.com/prettier/prettier/pull/5577))
- TypeScript: inline method decorators should stay inlined ([#5444](https://github.com/prettier/prettier/pull/5444))
- TypeScript: do not change `module` into `namespace` and break/hug their body correctly ([#5551](https://github.com/prettier/prettier/pull/5551))
- TypeScript: do not add invalid semicolon for construct in interface with `// prettier-ignore` ([#5469](https://github.com/prettier/prettier/pull/5469))
- HTML: do not touch comments ([#5525](https://github.com/prettier/prettier/pull/5525))
- HTML: preserve bogus comments `<! ... >`/`<? ... >` ([#5565](https://github.com/prettier/prettier/pull/5565))
- HTML: support IE conditional start/end comment ([#5470](https://github.com/prettier/prettier/pull/5470))
- HTML: do not add extra indentation for js template in `<script>` ([#5527](https://github.com/prettier/prettier/pull/5527))
- HTML: leading spaces for the first interpolation in `<textarea>` are sensitive ([#5468](https://github.com/prettier/prettier/pull/5468))
- HTML: preserve content for element in `<pre>` correctly ([#5473](https://github.com/prettier/prettier/pull/5473))
- HTML: correct column for error code frame ([#5553](https://github.com/prettier/prettier/pull/5553))
- Angular: support interpolation in attributes ([#5573](https://github.com/prettier/prettier/pull/5573))
- Angular: do not print colon for `then` and `else` in `*ngIf` ([#5542](https://github.com/prettier/prettier/pull/5542))
- Angular/Vue: do not normalize tag/attribute names ([#5526](https://github.com/prettier/prettier/pull/5526), [#5549](https://github.com/prettier/prettier/pull/5549))
- Vue: preserve custom block ([#5458](https://github.com/prettier/prettier/pull/5458))
- Vue: remove unnecessary semicolon and preserve necessary semicolon for single expression in event bindings ([#5519](https://github.com/prettier/prettier/pull/5519))
- Vue: group `slot-scope` correctly ([#5563](https://github.com/prettier/prettier/pull/5563))
- Markdown: do not trim content in inline-math ([#5485](https://github.com/prettier/prettier/pull/5485))
- Markdown: add more category to CJK regex ([#5480](https://github.com/prettier/prettier/pull/5480))
- SCSS: update parser for performance improvements ([#5481](https://github.com/prettier/prettier/pull/5481))
- YAML: preserve the first document head end marker `---` ([#5502](https://github.com/prettier/prettier/pull/5502))
- API: resolve `ignored` field correctly in `.getFileInfo()` with absolute filePath ([#5570](https://github.com/prettier/prettier/pull/5570))
- API/CLI: fix a bug that caches for `.js` config files did not respect `.clearConfigCache()` ([#5558](https://github.com/prettier/prettier/pull/5558))
- API/CLI: ignore `unset` in `.editorconfig` ([#5550](https://github.com/prettier/prettier/pull/5550))
- CLI: report status code `0` for `--list-different` + `--write` ([#5512](https://github.com/prettier/prettier/pull/5512))
- Standalone: fix a regression for browser compatibility ([#5560](https://github.com/prettier/prettier/pull/5560))

# 1.15.2

[diff](https://github.com/prettier/prettier/compare/1.15.1...1.15.2)

- CLI: allow flag overriding ([#5390](https://github.com/prettier/prettier/pull/5390))
- JavaScript: do not apply test call formatting to arrow function without body ([#5366](https://github.com/prettier/prettier/pull/5366))
- JavaScript: do not duplicate comments in styled-components ([#5416](https://github.com/prettier/prettier/pull/5416))
- JavaScript: do not indent comments behind variable declarations ([#5434](https://github.com/prettier/prettier/pull/5434))
- JavaScript: inline property decorator should stay inline ([#5364](https://github.com/prettier/prettier/pull/5364), [#5423](https://github.com/prettier/prettier/pull/5423))
- JavaScript: treat `createSelector` as function composition ([#5430](https://github.com/prettier/prettier/pull/5430))
- Flow: do not move flow comment for function argument to its body ([#5435](https://github.com/prettier/prettier/pull/5435))
- Flow: force-break interface body to be consistent with TypeScript interface ([#5432](https://github.com/prettier/prettier/pull/5432))
- Flow/TypeScript: remove extra indentation for `extends` ([#5432](https://github.com/prettier/prettier/pull/5432))
- TypeScript: distinguish `module` and `namespace` correctly ([#5432](https://github.com/prettier/prettier/pull/5432))
- HTML: handle CRLF correctly ([#5393](https://github.com/prettier/prettier/pull/5393))
- HTML: handle `<pre>` with interpolation ([#5400](https://github.com/prettier/prettier/pull/5400))
- HTML: preserve content for `<template>` with unknown `lang` ([#5388](https://github.com/prettier/prettier/pull/5388))
- HTML: preserve incomplete IE conditional comments ([#5429](https://github.com/prettier/prettier/pull/5429))
- HTML: preserve unterminated IE conditional comments ([#5424](https://github.com/prettier/prettier/pull/5424))
- HTML: treat capital element as custom element ([#5395](https://github.com/prettier/prettier/pull/5395))
- Angular: add missing parens for pipe in ternary ([#5397](https://github.com/prettier/prettier/pull/5397))
- Angular: correctly print unary expression with operator `+` ([#5405](https://github.com/prettier/prettier/pull/5405))
- Angular: correctly handle parens ([#5387](https://github.com/prettier/prettier/pull/5387))
- Angular/Vue: whitespaces between interpolation and text are sensitive ([#5396](https://github.com/prettier/prettier/pull/5396))
- Vue: do not add invalid semicolon for `v-on` attribute value ([#5418](https://github.com/prettier/prettier/pull/5418))
- SCSS: do not crash on grid value ([#5394](https://github.com/prettier/prettier/pull/5394))
- Markdown: handle CRLF correctly ([#5414](https://github.com/prettier/prettier/pull/5414))
- Markdown: identify CJK correctly ([#5402](https://github.com/prettier/prettier/pull/5402))
- MDX: treat JSX code block same as in Markdown ([#5391](https://github.com/prettier/prettier/pull/5391))

# 1.15.1

[diff](https://github.com/prettier/prettier/compare/1.15.0...1.15.1)

- Markdown: do not keep increasing backslashes for dollar sign ([#5358](https://github.com/prettier/prettier/pull/5358))

# 1.15.0

[diff](https://github.com/prettier/prettier/compare/1.14.3...1.15.0)

🔗 [Release Notes](https://prettier.io/blog/2018/11/07/1.15.0.html)

# 1.14.3

[diff](https://github.com/prettier/prettier/compare/1.14.2...1.14.3)

- Chore: add missing LICENSE ([#5114](https://github.com/prettier/prettier/pull/5114))

# 1.14.2

[diff](https://github.com/prettier/prettier/compare/1.14.1...1.14.2)

- YAML: fix the line ending issue on Windows ([#4957](https://github.com/prettier/prettier/pull/4957))
- TypeScript: better error message ([#4947](https://github.com/prettier/prettier/pull/4947))

# 1.14.1

[diff](https://github.com/prettier/prettier/compare/1.14.0...1.14.1)

- JavaScript: add parens for unary in bind ([#4950](https://github.com/prettier/prettier/pull/4950))
- JavaScript: format angular jasmine `it("should ...", fakeAsync(() => { ...` correctly. ([#4954](https://github.com/prettier/prettier/pull/4954))
- JavaScript: Revert this/super blacklist for function composition heuristic ([#4936](https://github.com/prettier/prettier/pull/4936))
- JavaScript: no extra space on Flow interface method named `static` ([#4910](https://github.com/prettier/prettier/pull/4910))
- JavaScript: no extra line break in destructed assignment of ternary ([#4932](https://github.com/prettier/prettier/pull/4932))
- Flow: print ObjectTypeInternalSlot with both flow/babel parsers ([#4869](https://github.com/prettier/prettier/pull/4869))
- TypeScript: no invalid output for ImportType in TypeReference ([#4939](https://github.com/prettier/prettier/pull/4939))
- YAML: do not throw on duplicate merge key ([#4931](https://github.com/prettier/prettier/pull/4931))
- YAML: no duplicate comments in mappingValue ([#4931](https://github.com/prettier/prettier/pull/4931))
- YAML: print end comment in nested mapping correctly ([#4918](https://github.com/prettier/prettier/pull/4918))
- YAML: do not put singleline values on a separate line from the key ([#4916](https://github.com/prettier/prettier/pull/4916))
- YAML: prefer dash as document separator ([#4921](https://github.com/prettier/prettier/pull/4921))
- API: update support info for Flow ([#4943](https://github.com/prettier/prettier/pull/4943))
- CLI: ignore .git, .svn and .hg directories ([#4906](https://github.com/prettier/prettier/pull/4906))
- CLI: support TOML configuration files ([#4877](https://github.com/prettier/prettier/pull/4877))

# 1.14.0

[diff](https://github.com/prettier/prettier/compare/1.13.7...1.14.0)

🔗 [Release Notes](https://prettier.io/blog/2018/07/29/1.14.0.html)

# 1.13.7

[diff](https://github.com/prettier/prettier/compare/1.13.6...1.13.7)

- Remove calls to `eval("require")` in the distributed code ([#4766](https://github.com/prettier/prettier/pull/4766))

# 1.13.6

[diff](https://github.com/prettier/prettier/compare/1.13.5...1.13.6)

- Upgrade Flow parser to 0.75.0 ([#4649](https://github.com/prettier/prettier/pull/4649) and [#4727](https://github.com/prettier/prettier/pull/4727))
- Preserve type parameters of import-types in TypeScript ([#4662](https://github.com/prettier/prettier/pull/4662))
- Preserve parens for type casting for sub-item ([#4648](https://github.com/prettier/prettier/pull/4648))

# 1.13.5

[diff](https://github.com/prettier/prettier/compare/1.13.4...1.13.5)

- Better handling of trailing spaces in Markdown ([#4593](https://github.com/prettier/prettier/pull/4593))
- Fix empty file error in JSON and GraphQL ([#4553](https://github.com/prettier/prettier/pull/4553))
- Preserve decorator on TypeScript interfaces ([#4632](https://github.com/prettier/prettier/pull/4632))
- Inline \_ or \$ in the root of a method chain ([#4621](https://github.com/prettier/prettier/pull/4621))

# 1.13.4

[diff](https://github.com/prettier/prettier/compare/1.13.3...1.13.4)

- Fix a regression when printing graphql-in-js ([#4616](https://github.com/prettier/prettier/pull/4616))

# 1.13.3

[diff](https://github.com/prettier/prettier/compare/1.13.2...1.13.3)

- Fix a regression when printing `hasOwnProperty` and other functions in `Object`'s prototype ([#4603](https://github.com/prettier/prettier/pull/4603))
- Fix a regression in exit status when using `--debug-check` and `--list-different` ([#4600](https://github.com/prettier/prettier/pull/4600))

# 1.13.2

[diff](https://github.com/prettier/prettier/compare/1.13.1...1.13.2)

- Republished 1.13.1 with missing README included this time

# 1.13.1

[diff](https://github.com/prettier/prettier/compare/1.13.0...1.13.1)

- Revert default parser change in API (still present in CLI)

# 1.13.0

[diff](https://github.com/prettier/prettier/compare/1.12.1...1.13.0)

🔗 [Release Notes](https://prettier.io/blog/2018/05/23/1.13.0.html)

# 1.12.1

[diff](https://github.com/prettier/prettier/compare/1.12.0...1.12.1)

- Fix for tag being removed from CSS with embedded expressions ([#4302](https://github.com/prettier/prettier/pull/4302))
- Wrap awaits in unary expressions with parens ([#4315](https://github.com/prettier/prettier/pull/4315))
- Fix style regression on flow union types ([#4325](https://github.com/prettier/prettier/pull/4325))

# 1.12.0

[diff](https://github.com/prettier/prettier/compare/1.11.1...1.12.0)

🔗 [Release Notes](https://prettier.io/blog/2018/04/11/1.12.0.html)

# 1.11.1

[diff](https://github.com/prettier/prettier/compare/1.11.0...1.11.1)

- 1.11.0 was incorrectly shipped with the wrong version of the TypeScript parser, which broke conditional types. This release fixes it.
- Fixed an issue relating to deprecated parsers ([#4072](https://github.com/prettier/prettier/pull/4072))

# 1.11.0

[diff](https://github.com/prettier/prettier/compare/1.10.2...1.11.0)

🔗 [Release Notes](https://prettier.io/blog/2018/02/26/1.11.0.html)

# 1.10.2

[diff](https://github.com/prettier/prettier/compare/1.10.1...1.10.2)

- Fixed an issue printing .vue files with self-closing tags. (#3705 by duailibe)

# 1.10.1

[diff](https://github.com/prettier/prettier/compare/1.10.0...1.10.1)

- Fixed an issue where the CLI fails to resolve a file.

# 1.10.0

[diff](https://github.com/prettier/prettier/compare/1.9.2...1.10.0)

🔗 [Release Notes](https://prettier.io/blog/2018/01/10/1.10.0.html)

# 1.9.2

[diff](https://github.com/prettier/prettier/compare/1.9.1...1.9.2)

- Fixed trailing comma not being printed in function calls if the last arg was an arrow (#3428 by duailibe)
- Ignore whitespace after the `/**` in docblocks (#3430 by duailibe)
- Fixed a bug where `get` and `set` class properties arrows would print an unnecessary semicolon with `--no-semi` (#3434 by duailibe)
- Fixed a bug for missing `.editorconfig` files (#3439 by josephfrazier)
- Fix comments being moved in class methods and object properties with the babylon parser (#3441 by duailibe)
- Better printing of member chains with a TSNonNullExpression (`!` character) (#3442 by duailibe)
- Fix missing commas in object properties when a `prettier-ignore` comment is present (#3448 by duailibe)
- Fix printing union types inside a function param type (#3446 by duailibe)
- Fix closing parens on multi-line intersection/union type (#3436 by josephfrazier)
- Don't break single argument destructuring arguments (for arrays and with simple default values) (#3443 by duailibe)

# 1.9.1

[diff](https://github.com/prettier/prettier/compare/1.9.0...1.9.1)

- Fixed a bug of comments with JSX fragments being duplicated in output (#3398 by duailibe)
- Fixed a bug that Prettier would fail when using tabs (#3401 by ikatyang)
- Fixed a regression that removed trailing commas when printing JS code blocks in Markdown (#3405 by azz)
- Fixed a bug when using glob `**/*` which would try to format directories (#3411 by duailibe)
- Fixed a bug when `.editorconfig` had `max_line_length = "off"` (#3412 by duailibe)

# 1.9.0

[diff](https://github.com/prettier/prettier/compare/1.8.2...1.9.0)

🔗 [Release Notes](https://prettier.io/blog/2017/12/05/1.9.0.html)

# 1.8.2

[diff](https://github.com/prettier/prettier/compare/1.8.1...1.8.2)

- Markdown: Don't break on links (#3204 by ikatyang)
- Markdown: Add `--no-prose-wrap` option (#3199 by ikatyang)
- TypeScript: Parenthesis around TSAsExpression inside TSAbstractClassDeclaration (#3191 by duailibe)
- JSON: Print JSON top comments as leading comments of root node (#3187 by duailibe)

# 1.8.1

[diff](https://github.com/prettier/prettier/compare/1.8.0...1.8.1)

- Force JSON to no trailing comma in multiparser (#3182 by azz)
- Don't add trailing commas in JSXAttribute for arrow functions (#3181 by duailibe)
- Markdown: Allow more cases that `_`-style emphasis is available (#3186 by ikatyang)
- Markdown: Handle additional spaces before `code` (#3180 by ikatyang)
- Markdown: Do not break on unbreakable place (#3177 by ikatyang)
- Markdown: Do not break before special prefix (#3172 by ikatyang)

# 1.8.0

[diff](https://github.com/prettier/prettier/compare/1.7.4...1.8.0)

🔗 [Release Notes](https://prettier.io/blog/2017/11/07/1.8.0.html)

# 1.7.4

[diff](https://github.com/prettier/prettier/compare/1.7.3...1.7.4)

- Force template literals to break after \` for styled-components (#2926 by duailibe)
- Update cosmiconfig to v3.1.0 (#2952 by ikatyang)
- Respect --stdin-filepath, regardless of config source (#2948 by azz)

# 1.7.3

[diff](https://github.com/prettier/prettier/compare/1.7.2...1.7.3)

- Fix cosmiconfig in the built version of Prettier (#2930 by lydell)
- Fix: ignore and show warning for unknown option from config file (#2929 by ikatyang)
- Don't use parens with optional chaining member expressions (#2921 by azz)

# 1.7.2

[diff](https://github.com/prettier/prettier/compare/1.7.1...1.7.2)

- Revert "Fix line break in test declarations with a single argument function declaration" (#2912)

# 1.7.1

[diff](https://github.com/prettier/prettier/compare/1.7.0...1.7.1)

- Enable cosmiconfig rcExtensions (#2749 by elektronik2k5)
- Keep original empty lines in argument list (#2763 by jackyho112)
- Upgrade prettier dependency to 1.7.0, fix lint (#2821 by josephfrazier)
- Fix different precedence binary expression when inlining (#2827 by duailibe)
- Bump Babylon (#2831 by existentialism)
- Don't lowercase Less variables when parsed with SCSS parser (#2833 by lydell)
- Don't lowercase `&class` in SCSS/Less selectors (#2834 by lydell)
- Add support for ClassPrivateProperty (#2837 by existentialism)
- Upgrade cosmiconfig to v3, remove hardcoded combinatorial problem (#2843 by azz)
- Split Less and SCSS parsing into different parsers (#2844 by lydell)
- feat: support detailed `--help` (#2847 by ikatyang)
- Update cosmiconfig to 3.0.1 to avoid memory leak (#2848 by danez)
- chore: add prettier-stylelint to the related projects (#2859 by hugomrdias)
- Don't lowercase SCSS placeholder selectors (#2876 by lydell)
- Fix line break in test declarations with 2nd argument as a function (#2877 by duailibe)
- Use semicolons in Flow interface-like bodies (#2593) (#2888 by motiz88)
- We do not need to have a reference to the toolbox-companion since we (#2892 by mitermayer)
- fix(cli): validate options for every `config-precedence` (#2894 by ikatyang)
- fix: do not print stack trace for invalid option (#2895 by ikatyang)
- refactor: use custom error (#2896 by ikatyang)
- fix(typescript): allow symbol type (#2899 by ikatyang)
- Support fit(), xit(), it.only(), etc (#2900 by azz)
- Fix editor styling on empty editors (#2904 by jakegavin)
- Fix printing of comments between decorators and method names (#2906 by azz)

# 1.7.0

[diff](https://github.com/prettier/prettier/compare/1.6.1...1.7.0)

🔗 [Release Notes](https://prettier.io/blog/2017/09/15/1.7.0.html)

# 1.6.1

[diff](https://github.com/prettier/prettier/compare/1.6.0...1.6.1)

- Fix CLI option parsing with no arguments (#2684)
- Fix config file finding when using stdin (#2692)
- Fix union type with type params regression (#2688)
- Fix flow parenthesis regression (#2687)

# 1.6.0

[diff](https://github.com/prettier/prettier/compare/1.5.3...1.6.0)

🔗 [Release Notes](https://prettier.io/blog/2017/08/29/1.6.0.html)

# 1.5.3

[diff](https://github.com/prettier/prettier/compare/1.5.2...1.5.3)

- Force trailingComma option to "none" when parser is JSON (#2335)

# 1.5.2

[diff](https://github.com/prettier/prettier/compare/1.5.1...1.5.2)

- Full printing support for GraphQL and various bug fixes
- Fixes for range formatting for JSON and CSS (#2295, #2298)

# 1.5.1

[diff](https://github.com/prettier/prettier/compare/1.5.0...1.5.1)

- Go back to babylon beta 13 (#2289)
- Inline import('x') to avoid having trailing comma (#2288)

# 1.5.0

[diff](https://github.com/prettier/prettier/compare/1.4.4...1.5.0)

🔗 [Release Notes](https://prettier.io/blog/2017/06/28/1.5.0.html)

# 1.4.4

🔗 Fix postcss, I forgot to re-run the build script :(

# 1.4.3

[diff](https://github.com/prettier/prettier/compare/1.4.2...1.4.3)

- Fix support for node 4 (#1988)
- Fix website on iOS Safari (#1970)

Formatting change:

- Position JSX whitespace (`{" "}`) at the end of lines (#1964)

Lots of small fixes, mainly for TypeScript.

# 1.4.2

[diff](https://github.com/prettier/prettier/compare/1.4.1...1.4.2)

- fix(decorators): do not inline methods with decorators with babylon (#1934)
- fix(typescript): print semi with inline interfaces/types (#1936)
- fix(typescript): no semi after export default abstract class, fixes (#1937)
- TypeScript: fix trailing comma in enum (#1938)

# 1.4.1

[diff](https://github.com/prettier/prettier/compare/1.4.0...1.4.1)

- Lots of fixes for TypeScript and regressions from 1.4.0. If you are using 1.4.0, you should migrate to 1.4.1 asap ;)

# 1.4.0

[diff](https://github.com/prettier/prettier/compare/1.3.1...1.4.0)

🔗 [Release Notes](https://prettier.io/blog/2017/06/03/1.4.0.html)

# 1.3.1

[diff](https://github.com/prettier/prettier/compare/1.3.0...1.3.1)

- Respect template inline-ness (#1497)

# 1.3.0

[diff](https://github.com/prettier/prettier/compare/1.2.2...1.3.0)

🔗 [Release Notes](https://prettier.io/blog/2017/05/03/1.3.0.html)

- add printer branches for some TypeScript nodes (#1331)
- Skip trailing commas with FlowShorthandWithOneArg (#1364)
- add TSLastTypeNode and TSIndexedAccessType (#1370)
- add TSConstructorType (#1367)
- fix do-while break (#1373)
- Fix missing trailing commas on flow generics (#1381)
- Add example of using yarn test with arguments (#1383)
- Have --debug-check also run ast verification (#1337)
- Fix empty line in block with EmptyStatement (#1375)
- parent decides how to print type annotations (#1391)
- add TSTypeOperator (#1396)
- fix TSTypeReference not printing typeArguments (#1392)
- add TSMappedType and TSTypeParameter (#1393)
- fix TSFunctionType failing on TypeParameters (#1394)
- add TSIntersectionType (#1395)
- fix typeParameters printing TSFunctionType w/o breaking flow (#1397)
- Fix optional flow parenthesis (#1357)
- [experimental] Add linting step in test pipeline (#1172)
- fix VariableDeclarator not printing type parameters (#1415)
- add TSMethodSignature (#1416)
- Add TSParameterProperty, TSAbstractClassDeclaration and TSAbstractMethodDefinition (#1410)
- Inline nullable in flow generics (#1426)
- fixed method 'check' error 'format' of undefined (#1424)
- feat(typescript): add declare modifier support for vars, classes and functions (#1436)
- Allow flow declarations to break on StringLiteralTypeAnnotations (#1437)
- Require '::a.b' to have a preceding ; in no-semi style (#1442)
- Require '(a || b).c++' to have a preceding ; in no-semi style (#1443)
- Upgrade flow parser to 0.45 (#1447)
- Add supertype tests and add TSAbstractClassProperty (#1467)
- Break class expression returned by arrow call (#1464)
- update typescript snapshots to account for #1464 (#1470)
- [WIP] add TSNamespaceExportDeclaration (#1459)
- update yarn.lock (#1471)
- [RFC] Do not indent calls with a single template literal argument (#873)
- Proper indentation for template literals (#1385)
- Add parenthesis for unusual nested ternaries (#1386)
- Preserve inline comment as last argument (#1390)
- Only add parenthesis on ternaries inside of arrow functions if doesn't break (#1450)
- Fix windows line ending on template literals (#1439)
- Add space around `=` for flow generics default arguments (#1476)
- Don't break for unparenthesised single argument flow function (#1452)
- Don't break on empty arrays and objects (#1440)
- Do not break on `[0]` (#1441)
- Reorder flow object props (#1451)
- Break inline object first in function arguments (#1453)
- Break inline object first in function arguments (#1453) (#1173)
- Inline template literals as arrow body (#1485)

# 1.2.2

[diff](https://github.com/prettier/prettier/compare/1.2.1...1.2.2)

- Only break for conditionals (#1350)

# 1.2.1

[diff](https://github.com/prettier/prettier/compare/1.2.0...1.2.1)

- Fix duplicate comments in classes (#1349)

# 1.2.0

[diff](https://github.com/prettier/prettier/compare/1.1.0...1.2.0)

🔗 [Release Notes](https://prettier.io/blog/2017/04/20/1.2.0.html)

- match jsx files in pre-commit hook (#1276)
- Fix isPreviousLineEmpty on Windows (#1263)
- Add --dev option to suggested install cmd (#1289)
- Write out change CLI changes synchronously. Fixes #1287. (#1292)
- Remove emoji part from lint-staged's name (#1302)
- omit 'doc' key from options object before passing it to format() (#1299)
- Skip globbing filenames with node-glob when the filename is not a glob (#1307)
- FIX: more documentation for jetbrains (#1265)
- Fix template literal comments (#1296)
- Double quotes for option values in Readme file (#1314)
- Do not print the sub-tree when using prettier-ignore (#1286)
- Bail when traversing === groups (#1294)
- Avoid breaking arguments for last arg expansion (#1305)
- Add typescript as a valid parser value (#1318)
- Add JetBrains File Watcher docs (#1310)
- Add prettier_d to Related Projects (#1328)
- Add parentheses for assignment as body of arrow (#1326)
- Add information about Vim's other autocmd events (#1333)
- add printer branch for TSFirstTypeNode (#1332)
- Optimize `prettier --help` for humans (#1340)
- Update link to @vjeux's React London presentation (#1330)
- Improve regex printing (#1341)
- Fix arrow function parenthesis with comments in flow (#1339)
- Break if () if conditional inside breaks (#1344)
- Don't inline paren at right of arguments (#1345)

# 1.1.0

[diff](https://github.com/prettier/prettier/compare/1.0.0...1.1.0)

- Prettier 1.0 is the stabler release we've been waiting for (#1242)
- fix small typo (#1255)
- Fix : ReferenceError: err is not defined (#1254)
- Document debugging strategies (#1253)
- Do not inline member expressions as part of assignments (#1256)
- Fix flow union params (#1251)
- Use a whitelist instead of blacklist for member breaking (#1261)
- Remove trailing whitespace (#1259)
- Get rid of fixFaultyLocations code (#1252)
- Fixing n.comments check in printer (#1239)
- [WIP] no-semi comments (#1257)

# 1.0.1

- change semi default

# 1.0.0

[diff](https://github.com/prettier/prettier/compare/0.22.0...1.0.0)

🔗 [Release Notes](https://prettier.io/blog/2017/04/13/1.0.0.html)

# 0.22.0

[diff](https://github.com/prettier/prettier/compare/0.21.0...0.22.0)

- Run 0.21.0 (#876)
- Fix paren removal on UnionTypeAnnotation (#878)
- Fix typo (#891)
- Ensure no parens for JSX inside of an ArrayExpression (#895)
- Fix object expression in arrow function expression (#897)
- Fix unprinted comments in destructuring (#898)
- Fix bug with importing empty type (#904)
- Fix broken export comment (#899)
- Add CLI Example to Readme (#909)
- Fix 0.5e0 (#911)
- Fix binary expression instanceof in arrow function expression (#913)
- Improve readme CLI usage example (#910)
- Do not break long it/test calls when template literal (#893)
- Update lint-staged docs to use husky for less config. (#923)
- Fix files with comments only (#813)
- Update README.md (#928)
- Fix binary op as body in arrow expression (#921)
- cleanup needsParens (#935)
- [JSX] Break if opening element breaks (#942)
- Parenthesize function expressions in expression position (#941)
- update the README to add a pre-commit hook (#944)
- Fix #951: properly parenthesize \*\* expressions (#952)
- [WIP] TypeScript Parser (#915)
- Do not break long `describe` calls (#953)
- Recursively find leading comments inside ReturnStatements (#955)
- Fix `in` inside of a for in a nested way (#954)
- Make comments around empty parenthesis be inside (#957)
- Stabilize comment after object label (#958)
- Inline BinaryExpressions inside JSXExpression (#965)
- Only allow same-line arrow-less body for explicit nodes (#966)

# 0.21.0

[diff](https://github.com/prettier/prettier/compare/0.20.0...0.21.0)

- [JSX] Break before and after jsx whitespace (#836)
- re-run snapshot tests
- Run prettier 0.20.0 (#835)
- [JSX] Don't wrap JSX Elements in parentheses in {} (#845)
- Fix comment after the last argument of a function (#856)
- Fix travis build image
- Do not break require calls (#841)
- Stabilize import as comments (#855)
- Fix jsx expression comment that break (#852)
- Inline last arg function arguments (#847)
- Keep parenthesis on export default function (#844)
- Inline short expressions for boolean operators too (#826)
- Introduce -l option (#854)
- Add parenthesis around assignments (#862)
- Do not put \n after label (#860)
- Fix comment for `call( // comment` (#858)
- Do not break long it calls (#842)
- Fix flow union comments (#853)

# 0.20.0

[diff](https://github.com/prettier/prettier/compare/0.19.0...0.20.0)

- Fix extra parens for update expressions (#796)
- Fix empty options (#803)
- Eagerly evaluate `ifBreak` when processing template literals (fixes #795
- Fix function declaration params comments (#802)
- Update flow to 0.40 (#808)
- Correct link for travis
- Fix function call args (#809)
- Properly support `do` (#811)
- Do not put parenthesis around not named default export (#819)
- Adds another preset to related projects (#820)
- Fix trailing commas in docs (#825)
- Put short body of arrow functions on the same line (#829)
- Preserve new lines for comments after `=` (#830)
- Fix indentation of a merged group (#828)
- Migrate class comments to the beginning (#831)
- Update list of related projects (#833)
- Allow breaking for logical expressions in member chains (#827)

# 0.19.0

[diff](https://github.com/prettier/prettier/compare/0.18.0...0.19.0)

- docs(README): use yarn add for consistency (#734)
- Make trailing-comma option support 2 different modes (#641)
- Update README with valid trailingComma options
- Fix await ternary parenthesis (#740)
- Fix missing dangling comment in exports (#741)
- Fix missing dangling comments in arrays (#744)
- Remove extra parenthesis around await inside of unary expression (#745)
- Fix missing dangling comments in for loop (#742)
- Add note about trailingComma option in versions 0.18.0 and below
- Add missing explanatory comment in ForStatement case (#748)
- Fix leading & operators in flow types (#738)
- Fix missing comments in assignment pattern (#704)
- Correctly place trailing comments in conditionals (#754)
- Use double quotes in script wildcards to support windows `cmd.exe`. (#761)
- Upgrade to Jest 19 (#762)
- Upgrade to Jest 19.0.1 (#779)
- Remove extra parens around ternary arguments of a new call (#776)
- Do not attach comments to EmptyStatements in try/catch (#763)
- Bump babylon & add test for async func decl (#790)
- Add `this` for Member factory whitelist and remove softline (#782)
- Do not expand empty catch (#783)
- Group [0] at the end of the previous chain instead of beginning of next one (#784)
- Do not format template literals (#749)
- Revert babylon bump (#792)
- Do not put trailing commas for function declaration in es5 mode (#791)
- [WIP] Fix comments in template literals (#643)
- Introduce line-suffix-boundary (#750)
- [RFC] Add parenthesis around && inside of || (#780)
- Fix tests on node 4

# 0.18.0

[diff](https://github.com/prettier/prettier/compare/0.17.1...0.18.0)

- fix --debug-check
- [JSX] Don't add newline following newline (#690)
- [Docs] Use replaceState API when demo code changes (#710)
- Do not inline new as last argument (#705)
- Inline objects & arrays as right part of a boolean expression (#692)
- [RFC] Remove parenthesis object special case (#689)
- Ensure importKind is printed (#718)
- [Docs]: update Readme to reference VS extension (#720)
- docs: Add pre-commit hook with 🚫💩 lint-staged section to the README (#714)
- [RFC] Preserve new lines between array elements (#707)
- Do not put \n inside of empty object method bodies (#706)
- Align boolean inside of arrow functions (#691)
- Fix trailing new lines preservation (#724)
- Unified Split

# 0.17.1

[diff](https://github.com/prettier/prettier/compare/0.17.0...0.17.1)

- Use `readline` api to manipulate `process.stdout` output. (#687)

# 0.17.0

[diff](https://github.com/prettier/prettier/compare/0.16.0...0.17.0)

- [JSX] Fix spurious newline (fixes #614) (#628)
- Add --debug-check cli option (#627)
- Remove last trailing line for directives-only files (#609)
- Expand vim instructions
- Fix formatting in readme
- Update snapshots
- Preserve empty line before last comment (#594)
- test on current release of node.js (#595)
- [JSX] jsx-whitespace breaks with parent (fixes #622) (#626)
- Log filename with [update] or [ignore] flags during `--write` process. (#584)
- Do not indent binary expressions inside of if (#604)
- Put short elements at right of single binary expression on same line (#605)
- Run prettier 0.16.0 on the codebase (#631)
- Preserve blank lines inside of objects (#606)
- fix typo in JetBrains External Tool config readme (#679)
- Fix dangling comments for arrays (#665)
- Print line-suffix in --debug-print-doc (#676)
- Avoid unneeded parenthesis for colon with comments (#673)
- Stabilize comments inside of if/then/else before { (#672)
- Soft break the first member of a chain (#667)
- Stabilize comments inside of ternaries (#666)
- Fix trailing commas with a trailing comment (#664)
- Fix Flow union type annotations indentation (#650)
- Ensure that all comments are printed (#571)
- Properly support member chains comments (#668)
- [WIP] Fix Flow DeclareTypeAlias (#669)
- Add option for putting > on the last line in jsx (#661)
- Always put a hardline before dangling comment (#675)
- Fix comments in return statement argument (#657)
- [RFC] Introduce prettier-ignore-next (#671)

# 0.16.0

[diff](https://github.com/prettier/prettier/compare/0.15.0...0.16.0)

- Revert "Print \x and \u escapes in strings and regexes lowercase (#522)
- Fix ternary indent bug (#577)
- jsx parentheses fix (#580)
- Run prettier on 0.15.0 (#558)
- Add parenthesis around single argument arrow if comments (#573)
- Use breakParent inside of last arrow expansion (#559)
- Support dangling comments in ClassBody (#570)
- Make all the member expressions but the last one part of the first group (#589)
- Break long imports (#590)
- Remove the concept of globalPrecedingNode (#561)
- Remove test.js and put it back in the gitignore
- Fix use strict as expression statement (#602)
- Use arrow function when inputted that way for flow objects (#608)
- Better support try/catch comments (#607)
- Print CallExpression comments inside of memberChain (#600)
- Do not attach comments to EmptyStatement (#599)
- Fix files with only comments on the flow parser (#598)
- Remove first line special case (#597)
- Fix single indented JSX comment (#596)
- Print dangling on ast on all the paths

# 0.15.0

[diff](https://github.com/prettier/prettier/compare/0.14.1...0.15.0)

- Fix syntax error in empty object with dangling comment (#533)
- Fix closing call expression commented out (#530)
- Update `bracketSpacing` comment to say it's about {} (#529)
- Add 0.14.1 to CHANGELOG (#525)
- Print \x and \u escapes in strings and regexes lowercase (#522)
- Fix Jetbrains example screenshot url. (#534)
- Preserve next line with trailing comment (#535)
- Break nested calls (#517)
- Update snapshot tests from conflicting PRs
- Reimplement MemberExpression printing (#469)
- Remove spurious test.js
- Fix small typo on Jetbrains section (#552)
- [JSX] Handle non-breaking space (#557)
- Make comments between if & else to look good (#544)
- Whitelist UnaryExpression for parentless objects (#545)
- Make comments inside of MemberExpression look good (#556)

# 0.14.1

[diff](https://github.com/prettier/prettier/compare/0.14.0...0.14.1)

- Fix range for object newline detection (#520)
  - a bugfix for "Keep expanded objects expanded" (#495)

# 0.14.0

[diff](https://github.com/prettier/prettier/compare/0.13.0...0.14.0)

- Only write to files if the change (#511)
- Remove extra group when printing object values (#502)
- Add documentation for JetBrains products. (#509)
- Don't print trailing commas for object destructuring and rest (#512)
- Mention eslint-config-prettier (#516)
- [RFC] Keep expanded objects expanded (#495)
- Do not always put an empty lines after directives (#505)
- Print numbers in a uniform way (#498)

# 0.13.0

[diff](https://github.com/prettier/prettier/compare/0.12.0...0.13.0)

- Simplify arrow functions that use blocks (#496)
- Properly print comments for BinaryExpression (#494)
- Preserve empty line after comment (#493)
- [JSX] Handle each line of text separately (#455)
- Proper support for dangling comments (#492)

# 0.12.0

[diff](https://github.com/prettier/prettier/compare/0.11.0...0.12.0)

- [WIP] Add rationale document (#372)
- Proper parenthesis for yield and await in conditional (#436)
- Don't print double newlines at EOF to stdout (#437)
- Explain the `--color` option in a comment (#434)
- Validate user-provided config with jest-validate (#301)
- Propagate breaks upwards automatically, introduce `breakParent` (#440)
- Fix typo in variable name (#441)
- Refactor traversal (#442)
- Do not put a newline on empty `{}` for functions (#447)
- Better error message for assertDoc (#449)
- Remove `multilineGroup` (#450)
- Ability to break on `:` for objects (#314)
- Update snapshots
- [RFC] Do not put spacing inside of arrays with bracketSpacing (#446)
- Fix integer CLI arguments (#452)
- Move tests around (#454)
- Update package.json, use ast-types 0.9.4 (#453)
- Update lockfile
- Support printing import("a") (#458)
- Explain that you can pass options to the spec runner (#460)
- Fix spurious whitespace (#463)
- Preserve new lines after directives (#464)
- Put decorators on the same line (#459)
- docs: add related projects (#456)
- Add break points for class declaration (#466)
- Added parens around in operator in for loops 🚀. (#468)
- CLI improvements (#478)
- [RFC] Hug Conditionals in JSX (#473)
- Refactor comment algorithm and improve newline/spaces detection (#482)
- Indent ternaries (#484)
- Indent computed member (#471)
- Maintain windows line ending (#472)
- Don't break up JSXOpeningElement if it only has a single text (#488)
- Add CallExpression to the last argument expansion whitelist (#470)
- Mention eslint-plugin-prettier in Related Projects (#490)
- Stop using conditionalGroup inside of UnionTypeAnnotation (#491)

# 0.11.0

[diff](https://github.com/prettier/prettier/compare/0.0.10...0.11.0)

Now using minor versions instead of patch versions for the releases.

- Swap quotes (#355)
- Drop jsesc (#357)
- Use a Symbol instead of the private dep (#359)
- Add parens for default export FunctionExpressions (#345)
- Fix export extension output (#361)
- Exit with an error if an unknown CLI option is passed (#365)
- Warn if using deprecated CLI options (#364)
- s/jscodefmt/prettier/ (#370)
- Fix CLI options (#369)
- Fix some parens cases for UpdateExpressions (#381)
- Output strings with the minimum amount of escaped quotes (#390)
- Ignore EmptyStatement inside of switch case (#391)
- Support multiple standalones in import (#389)
- Fix missing semi-colon in for loop and var body (#388)
- Fix empty labels (#383)
- Fix forced trailing comma (#382)
- Empty switch should not have an empty line (#384)
- add formatAST() for formatting ASTs directly (#393)
- Fix class extends parenthesis (#396)
- Fix class inside of binary expression missing parenthesis (#397)
- Fix parenthesis in object as left-hand-side of template (#398)
- Remove unneeded parens for FunctionExpression inside LogicalExpression (#399)
- Remove trailing comma for array destructuring with rest (#400)
- Fix +++x (#401)
- Also do the class extend parenthesis for class expressions (#403)
- Fix various parenthesis issues on the left side of template (#404)
- Fix in inside of the first group of a for (#406)
- Add parenthesis for arrow function inside of ternary (#408)
- Add parenthesis around class expression when left side of call expression (#409)
- Ensure computed method names don't lose quotes (#419)
- Add parenthesis for yield inside of a conditional (#418)
- Add parenthesis around assignment for arrow function body (#422)
- Add parenthesis around export default assignments (#423)
- Add parenthesis for class expression on left of member expression (#421)
- Fix missing parens around object in MemberExpression (#424)
- Re-run snapshot tests
- Workaround flow bug around trailing comma (#427)
- Add parenthesis when class expressions are left of a ternary (#428)
- Revert "Workaround flow bug around trailing comma" (#429)
- Update commands.md (#430)
- Improve vim integration section (#416)
- Add glob support to the CLI (#363)
- Use babel-code-frame for syntax errors (#367)
- Update yarn.lock

# 0.0.10

[diff](https://github.com/prettier/prettier/compare/0.0.9...0.0.10)

- Add description to package.json (#320)
- Fix crash for single rest on class declaration (#315)
- Add canonical link to Prettier SublimeText package. (#318)
- Properly escape JSXText (#329)
- Hug objects and arrays inside of JSXExpressionContainer (#213)
- Add quotes around unicode keys in flow parser (#328)
- Add tests for comments (#330)
- Print dangling comments in blocks (#331)
- Remove Printer module in favor of single function (#333)
- Split pp.js into doc-{printer,builders,utils}.js (#334)
- Fix node 4 (#336)
- Remove unused functions from recast (#337)
- Kill fromString (#335)
- Extract parser.js (#338)
- Normalize exports (#339)
- Refactor index.js (#340)
- Add semicolon to more default exports (#343)
- Introduce --parser/parser option and deprecate --flow-parser/useFlowParser (#342)
- Remove parens around AwaitExpression in ternary (#346)
- Indent while test the same way as if test (#352)
- Add debugging support for doc IR (#347)

# 0.0.9

[diff](https://github.com/prettier/prettier/compare/0.0.8...0.0.9)

- Workaround flow bug parsing astral unicode characters (#277)
- Allow specifying the major mode that `defun-before-save` will use. (#276
- Fix space missing before `,` on export with bracket spacing off (#278)
- Fix space missing before `,` on import with bracket spacing off (#279)
- Add newline after shebang if necessary. (#215)
- Remove +1 from newline detection (#261)
- Fix path when printing member chains so parens work properly (fixes #243
- Ensure parens on NewExpression with function callee (#282)
- Fix missing semi when default exporting CallExpression (#287)
- Workaround flow parser bug with spread in arrays (#285)
- Update flow-parser to 0.38 (#290)
- Allow customizing args sent to prettier-command (#289)
- Do not output trailing commas with rest arguments (#283)
- Use exact versions in package.json (#291)
- Use js native String.repeat() (#293)
- Handle additional export default parens cases (#298)
- Fix parens around anonymous functions (#297)
- Introduce second argument to ifBreak (#302)
- Fix bracketSpacing typo in tests (#299)
- Remove unused variable (#304)
- Fix trailing whitespace (#300)
- add version flag (#294)
- Add --run-in-band to travis (#306)
- [JSX] Split elements on newlines and preserve whitespace (w/@yamafaktory) (#234)
- Print binary and logical expressions in a nicer format (#262)

# 0.0.8

[diff](https://github.com/prettier/prettier/compare/e447971...0192d58)

- Fix await parenthesis (#185)
- Add note about Sublime Test github issue in readme
- Remove legacy Recast code and simplify API. (#191)
- Don't break to new line if logical/loop statements are without brackets. (#194)
- Fix parenthesis for UpdateExpression (#198)
- Fix directives printing for empty functions (#199)
- Fix key quotes omission for flow parser (#203)
- Fix comma when an arrow function with no arguments breaks (#210)
- Last argument expansion works for arrow functions that return JSX (#211)
- Remove faulty location check on template literals that throws in Nuclide (#218)
- Add flow parser experimental options (#221)
- Fix empty exports (#225)
- Fix cases of missing parens with NewExpression (#230)
- Fix issue with ArrowFunctionExpression parens (#236)
- Add npm version badge (#240)
- Consolidate badges in readme
- Fix parens issue with nested UnaryExpressions (#237)
- Escape strings using jsesc (#229)
- Add newline for empty blocks {} (#205)
- Fix empty export with from clause (#248)
- Fix missing parenthesis for typeof and arrow functions (#249)
- Fix FunctionExpression parens issues (#250)
- Fix last element of an array being null (#232)
- Make sure empty for loops generate valid code (#224)
- Fix parens for functions inside TaggedTemplateExpression (#259)
- Preserve the way numbers were written (#257)

# 0.0.7

[diff](https://github.com/prettier/prettier/compare/7e31610...6f5df0e)

- Update live editor to 0.0.6
- Adds various prettier-browser changes (#175)
- Fix `[(0)]` (#179)
- Do not advance for forward skipSpaces (#176)
- Fix windows line-endings (#177)
- add license to package.json (#178)
- Fix exponent in babylon (#181)
- Make `declare type` consistent between babylon and flow (#183)
- Fix DeclareInterface (#182)
- Change test to workaround babylon bug (#184)

# 0.0.6

[diff](https://github.com/prettier/prettier/compare/faed09c...3af7da5)

- Format property names consistently
- remove node 0.10 from travis config, add travis badge to readme
- Update snapshots
- chore: link prettier package to its github project
- add gitter badge to readme
- add instructions for Visual Studio plugin
- Do not unquote string properties
- Add prettier-browser
- v0.0.5 -- Accidentally didn't push this commit out before others landed; 0.0.5 is actually based on commit faed09c
- update yarn.lock
- remove recast (not used)
- Always use double quotes for JSX and properly escape
- remove unused recast ref
- Fix typo in README.
- Support type annotation for rest argument on babylon parser
- Use `setq` instead of `infc` and `decf`
- Add title and encoding to the REPL
- Fix old name reference in tests_config
- Minimize string escapes
- Support method generics on babylon parser
- Break long `exports` into multiple lines.
- Use group instead of conditionalGroup
- Fix misprinting of computed properties in method chains. (#157)
- treat shebang outside of parsing (#137)
- Break multiline imports (#167)
- Do not put spaces on empty for loop (#169)
- Add trailing comma support for multiline exports (#168)
- Update run_spec to support options
- Add tests for bracketSpacing option
- Add tests for quotes option
- Add tests for tabWidth option
- Add tests for trailingComma option
- Fix for Node 4
- Add test for shebang and move to index.js (#170)
- Numeric literal callees should keep parens (#141)
- Remove leftover `arrowParensAlways` option (#171)
- Wrap Stateless JSX Arrow Functions and Assignment in Parens (fixes part of #73)
- Break JSXOpeningElement between attributes (fixes #15)
- JSX maintains spaces that matter (fixes #30 and thus part of #73)
- Multiline JSX opening tag breaks children out too (for #73)
- Add regression tests for long JSX Expression contents
- include index.js in format:all script (#132)
- Wrap ForStatement in a block for const decls (#172)
- Reprint all the files!
