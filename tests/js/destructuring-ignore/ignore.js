const {
  // prettier-ignore
  bar =           1,
} = foo

const {
  _,
  // prettier-ignore
  bar =           1,
} = foo

/* comments */
const {
  // prettier-ignore
  bar =           1,         // comment
} = foo

const {
  // prettier-ignore
  bar =           1,         /* comment */
} = foo

const {
  // prettier-ignore
  bar =           /* comment */          1,
} = foo

/* RestElement */
const {
  // prettier-ignore
  ...bar
} = foo

// Nested
const {
  baz: {
  // prettier-ignore
  foo = [1, 2,    3]
},
  // prettier-ignore
  bar =            1,
} = foo
