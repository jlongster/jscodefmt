/* eslint-disable import/no-extraneous-dependencies */
"use strict";

const path = require("path");
const { outdent } = require("outdent");
const { RuleTester } = require("eslint");
const { rules } = require(".");

const test = (ruleId, tests) => {
  new RuleTester({ parserOptions: { ecmaVersion: 2021 } }).run(
    ruleId,
    rules[ruleId],
    tests
  );
};

test("better-parent-property-check-in-needs-parens", {
  valid: ["function needsParens() {return parent.test === node;}"],
  invalid: [
    {
      code: 'return parent.type === "MemberExpression" && name === "object";',
      errors: [{ message: "`name` comparison should be on left side." }],
    },
    {
      code: "return parent.test === node;",
      output: 'return name === "test";',
      errors: [
        { message: 'Prefer `name === "test"` over `parent.test === node`.' },
      ],
    },
    {
      code: "return parent.test !== node;",
      output: 'return name !== "test";',
      errors: [
        { message: 'Prefer `name !== "test"` over `parent.test !== node`.' },
      ],
    },
    {
      code: 'return parent["property"] === node;',
      output: 'return name === "property";',
      errors: [
        {
          message:
            'Prefer `name === "property"` over `parent."property" === node`.',
        },
      ],
    },
  ].map((testCase) => ({
    ...testCase,
    code: `function needsParens() {${testCase.code}}`,
    output: `function needsParens() {${testCase.output || testCase.code}}`,
    filename: "needs-parens.js",
  })),
});

test("consistent-negative-index-access", {
  valid: [
    "getLast(foo)",
    "getPenultimate(foo)",
    "foo[foo.length]",
    "foo[foo.length - 3]",
    "foo[foo.length + 1]",
    "foo[foo.length + -1]",
    "foo[foo.length * -1]",
    "foo.length - 1",
    "foo?.[foo.length - 1]",
    "foo[foo?.length - 1]",
    "foo[foo['length'] - 1]",
    "foo[bar.length - 1]",
    "foo.bar[foo.      bar.length - 1]",
    "foo[foo.length - 1]++",
    "--foo[foo.length - 1]",
    "foo[foo.length - 1] += 1",
    "foo[foo.length - 1] = 1",
  ],
  invalid: [
    {
      code: "foo[foo.length - 1]",
      output: "getLast(foo)",
      errors: 1,
    },
    {
      code: "foo[foo.length - 2]",
      output: "getPenultimate(foo)",
      errors: 1,
    },
    {
      code: "foo[foo.length - 0b10]",
      output: "getPenultimate(foo)",
      errors: 1,
    },
    {
      code: "foo()[foo().length - 1]",
      output: "getLast(foo())",
      errors: 1,
    },
  ],
});

test("directly-loc-start-end", {
  valid: [],
  invalid: [
    {
      code: "options.locStart(node)",
      output: "locStart(node)",
      errors: [
        { message: "Please import `locStart` function and use it directly." },
      ],
    },
    {
      code: "options.locEnd(node)",
      output: "locEnd(node)",
      errors: [
        { message: "Please import `locEnd` function and use it directly." },
      ],
    },
  ],
});

test("flat-ast-path-call", {
  valid: [
    'path.call((childPath) => childPath.notCall(print, "b"), "a")',
    'path.notCall((childPath) => childPath.call(print, "b"), "a")',
    'path.call((childPath) => childPath.call(print, "b"))',
    'path.call((childPath) => childPath.call(print), "a")',
    'path.call((childPath) => notChildPath.call(print), "a")',
    'path.call(functionReference, "a")',
    'path.call((childPath) => notChildPath.call(print, "b"), "a")',
    // Only check `arrow function`
    'path.call((childPath) => {return childPath.call(print, "b")}, "a")',
    'path.call(function(childPath) {return childPath.call(print, "b")}, "a")',
  ],
  invalid: [
    {
      code: 'path.call((childPath) => childPath.call(print, "b"), "a")',
      output: 'path.call(print, "a", "b")',
      errors: [{ message: "Do not use nested `AstPath#call(…)`." }],
    },
    {
      // Trailing comma
      code: 'path.call((childPath) => childPath.call(print, "b"), "a",)',
      output: 'path.call(print, "a", "b")',
      errors: 1,
    },
  ],
});

test("jsx-identifier-case", {
  valid: [
    {
      code: "const isJSXNode = true",
      options: ["isJSXNode"],
    },
  ],
  invalid: [
    {
      code: "function isJSXNode(){}",
      output: "function isJsxNode(){}",
      errors: [{ message: "Please rename 'isJSXNode' to 'isJsxNode'." }],
    },
    {
      code: "const isJSXNode = true",
      output: "const isJsxNode = true",
      errors: [{ message: "Please rename 'isJSXNode' to 'isJsxNode'." }],
    },
  ],
});

test("no-ast-path-map-each", {
  valid: [
    "const a = array.map(() => {})",
    "const a = array.map()",
    "const a = array.map(...a, ...a)",
    "const a = some.path.map(() => {}, name)",
    "const a = path.map(print, name)",
    "const a = path.notMap(() => {}, name)",
    "array.each(() => {})",
    "array.each()",
    "array.each(...a, ...a)",
    "some.path.each(() => {}, name)",
    "path.notEach(() => {}, name)",
  ],
  invalid: [
    {
      code: outdent`
        const a = path.map((childPath) => {
          const node = childPath.getNode(); // comment
          console.log(childPath, {childPath, node})
        }, name)
      `,
      output: outdent`
        const a = path.mapValue((node) => {
           // comment
          console.log(path, {childPath: path, node})
        }, name)
      `,
      errors: 1,
    },
    {
      code: outdent`
        const a = path.map(() => {
        }, name)
      `,
      output: outdent`
        const a = path.mapValue(() => {
        }, name)
      `,
      errors: 1,
    },
    {
      code: "const a = path.map((chidPath) => {return chidPath}, name)",
      output: "const a = path.mapValue((value) => {return path}, name)",
      errors: 1,
    },
    {
      code: "const a = path.map(fn, name)",
      output: "const a = path.map(fn, name)",
      errors: 1,
    },
    {
      code: "const a = path.map(({x}) => {}, name)",
      output: "const a = path.map(({x}) => {}, name)",
      errors: 1,
    },
    {
      code: "const a = path.map((...args) => {}, name)",
      output: "const a = path.map((...args) => {}, name)",
      errors: 1,
    },
    {
      code: outdent`
        path.each((childPath) => {
          const node = childPath.getNode(); // comment
          console.log(childPath, {childPath, node})
        }, name)
      `,
      output: outdent`
        path.eachValue((node) => {
           // comment
          console.log(path, {childPath: path, node})
        }, name)
      `,
      errors: 1,
    },
    {
      code: "path.each(print, name)",
      output: "path.each(print, name)",
      errors: 1,
    },
  ],
});

test("no-doc-builder-concat", {
  valid: ["notConcat([])", "concat", "[].concat([])"],
  invalid: [
    {
      code: "concat(parts)",
      output: "(parts)",
      errors: 1,
    },
    {
      code: "concat(['foo', line])",
      output: "(['foo', line])",
      errors: 1,
    },
  ],
});

test("no-identifier-n", {
  valid: ["const a = {n: 1}", "const m = 1", "a.n = 1"],
  invalid: [
    {
      code: "const n = 1; alet(n)",
      output: "const node = 1; alet(node)",
      errors: 1,
    },
    {
      code: "const n = 1; alert({n})",
      output: "const node = 1; alert({n: node})",
      errors: 1,
    },
    {
      code: "const {n} = 1; alert(n)",
      output: "const {n: node} = 1; alert(node)",
      errors: 1,
    },
    {
      code: outdent`
        const n = 1;
        function a(node) {
          alert(n, node)
        }
        function b() {
          alert(n)
        }
      `,
      output: outdent`
        const n = 1;
        function a(node) {
          alert(n, node)
        }
        function b() {
          alert(n)
        }
      `,
      errors: [
        {
          suggestions: [
            {
              output: outdent`
                const node = 1;
                function a(node) {
                  alert(node, node)
                }
                function b() {
                  alert(node)
                }
              `,
            },
          ],
        },
      ],
    },
    {
      code: "const n = 1;const node = 2;",
      output: "const n = 1;const node = 2;",
      errors: [{ suggestions: [{ output: "const node = 1;const node = 2;" }] }],
    },
  ],
});

test("no-node-comments", {
  valid: [
    "const comments = node.notComments",
    {
      code: "function functionName() {return node.comments;}",
      filename: path.join(__dirname, "../../..", "a.js"),
      options: ["a.js"],
    },
    {
      code: "function functionName() {return node.comments;}",
      filename: path.join(__dirname, "../../..", "a.js"),
      options: [{ file: "a.js", functions: ["functionName"] }],
    },
  ],
  invalid: [
    ...[
      "function functionName() {return node.comments;}",
      "const {comments} = node",
      "const {comments: nodeComments} = node",
    ].map((code) => ({
      code,
      output: code,
      errors: [{ message: "Do not access node.comments." }],
    })),
    {
      code: "function notFunctionName() {return node.comments;}",
      output: "function notFunctionName() {return node.comments;}",
      filename: path.join(__dirname, "../../..", "a.js"),
      options: [{ file: "a.js", functions: ["functionName"] }],
      errors: [{ message: "Do not access node.comments." }],
    },
  ],
});

test("prefer-ast-path-each", {
  valid: ["const foo = path.map()"],
  invalid: [
    {
      code: "path.map()",
      output: "path.each()",
      errors: 1,
    },
  ],
});

test("prefer-indent-if-break", {
  valid: [
    "ifBreak(indent(doc))",
    "notIfBreak(indent(doc), doc, options)",
    "ifBreak(indent(doc), doc, )",
    "ifBreak(...a, ...b, ...c)",
    "ifBreak(notIndent(doc), doc, options)",
    "ifBreak(indent(doc), notSameDoc, options)",
    "ifBreak(indent(...a), a, options)",
    "ifBreak(indent(a, b), a, options)",
  ],
  invalid: [
    {
      code: "ifBreak(indent(doc), doc, options)",
      output: "indentIfBreak( doc, options)",
      errors: [
        {
          message: "Prefer `indentIfBreak(…)` over `ifBreak(indent(…), …)`.",
        },
      ],
    },
    {
      code: "ifBreak((indent(doc)), (doc), options)",
      output: "indentIfBreak( (doc), options)",
      errors: 1,
    },
  ],
});

test("prefer-is-non-empty-array", {
  valid: [
    // `isNonEmptyArray` self is ignored
    outdent`
      function isNonEmptyArray(object){
        return Array.isArray(object) && object.length;
      }
    `,
    "a.b && a.c.length",
    "a.b || !a.b.length",
    '!a["b"] || !a.b.length',
  ],
  invalid: [
    ...[
      "a && a.b && a.b.length",
      "a && a.b && a.b.length !== 0",
      "a && a.b && a.b.length > 0",
      "a && Array.isArray(a.b) && a.b.length",
      "a && Array.isArray(a.b) && a.b.length !== 0",
      "a && Array.isArray(a.b) && a.b.length > 0",
    ].map((code) => ({
      code,
      output: "a && isNonEmptyArray(a.b)",
      errors: 1,
    })),
    ...[
      "!a || !a.b || !a.b.length",
      "!a || !a.b || a.b.length === 0",
      "!a || !Array.isArray(a.b) || !a.b.length",
      "!a || !Array.isArray(a.b) || a.b.length === 0",
    ].map((code) => ({
      code,
      output: "!a || !isNonEmptyArray(a.b)",
      errors: 1,
    })),
  ],
});

test("require-json-extensions", {
  valid: ['require("./not-exists")', 'require("./index")'],
  invalid: [
    {
      code: 'require("./package")',
      filename: __filename,
      output: 'require("./package.json")',
      errors: [{ message: 'Missing file extension ".json" for "./package".' }],
    },
  ],
});

test("no-empty-flat-contents-for-if-break", {
  valid: [
    "ifBreak('foo', 'bar')",
    "ifBreak(doc1, doc2)",
    "ifBreak(',')",
    "ifBreak(doc)",
    "ifBreak('foo', '', { groupId })",
    "ifBreak(...foo, { groupId })",
  ],
  invalid: [
    {
      code: "ifBreak('foo', '')",
      output: "ifBreak('foo')",
      errors: [
        {
          message:
            "Please don't pass an empty string to second parameter of ifBreak.",
        },
      ],
    },
    {
      code: "ifBreak('foo'    ,     ''   )",
      output: "ifBreak('foo')",
      errors: [
        {
          message:
            "Please don't pass an empty string to second parameter of ifBreak.",
        },
      ],
    },
    {
      code: "ifBreak(doc, '')",
      output: "ifBreak(doc)",
      errors: [
        {
          message:
            "Please don't pass an empty string to second parameter of ifBreak.",
        },
      ],
    },
  ],
});

test("no-unnecessary-ast-path-call", {
  valid: [
    "call(foo)",
    'foo["call"](bar)',
    "foo.call?.(bar)",
    "foo?.call(bar)",
    "foo.call(bar, name)",
    "foo.notCall(bar)",
    "foo.call(...bar)",
    "foo.call()",
  ],
  invalid: [
    {
      code: "foo.call(bar)",
      output: "bar(foo)",
      errors: 1,
    },
    {
      code: "foo.call(() => bar)",
      output: "foo.call(() => bar)",
      errors: 1,
    },
  ],
});
