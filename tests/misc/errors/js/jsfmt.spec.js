const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      // v8intrinsic
      "::%DebugPrint(null)",
      "a.%DebugPrint();",
      "const i = %DebugPrint;",

      // partialApplication
      // https://babeljs.io/docs/en/babel-plugin-proposal-partial-application#invalid-usage
      "f(x + ?)", // `?` not in top-level Arguments of call
      "x + ?", // `?` not in top-level Arguments of call
      "?.f()", // `?` not in top-level Arguments of call
      // "new f(?)", // `?` not supported in `new`
      // "super(?)", // `?` not supported in |SuperCall|

      // https://github.com/tc39/proposal-private-fields-in-in#try-statement
      outdent`
        class C {
          #brand;

          static isC(obj) {
            return try obj.#brand;
          }
        }
      `,

      // Using a record or tuple literal on the `lhs` is a `SyntaxError`
      "const #{ a, b } = #{ a: 1, b: 2 };",
      "const #[a, b] = #[1, 2];",
      // holes
      // "const x = #[,];", // Should be error, babel didn't throw
      // __proto__
      // "const x = #{ __proto__: foo };", // Should be error, babel didn't throw

      // Don't support `syntaxType: "bar"`
      "[| 1 |]",
      // "{| a: 1 |}", // babel didn't throw on this
    ],
  },
  ["babel"]
);
