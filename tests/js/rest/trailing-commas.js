declare class C {
  f(
    superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,
    ...args
  ): void,
}

function f(
  superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,
  ...args
) {}

declare class C { f(...superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong): void; }

[superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,,];

[veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong, ...a] = [];
var {veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong, ...a} = {};

