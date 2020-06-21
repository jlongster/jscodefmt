// @flow

type Foo = {
  // comment
  ...,
};

type Foo = {
  /* comment */
  ...,
};

type Foo = { /* comment */ ... };

type Foo = { /* comment */
  ...};

type Foo = {
  // comment0
  // comment1
  ...,
};

type Foo = {
  /* comment0 */
  /* comment1 */
  ...,
};

type Foo = {
  // comment
  foo: string,
  ...
};

type Foo = {
  // comment0
  // comment1
  foo: string,
  ...
};

type Foo = {
  /* comment */
  foo: string,
  ...
};

type Foo = {
  /* comment */
  [string]: string,
  ...
};

type Foo = {
  /* comment0 */
  /* comment1 */
  foo: string,
  ...
};
