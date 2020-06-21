// @flow

declare var arrOfObjs: Array<{ foo: string }>;
declare var roArrOfObjs: $ReadOnlyArray<{foo: string}>;
declare var tup: [{foo: string}, {bar: number}];

(Object.assign({}, ...arrOfObjs): { foo: number}); // Error: string ~> number
(Object.assign({}, ...roArrOfObjs): { foo: number}); // Error: string ~> number
(Object.assign({}, ...tup): { foo: string, bar: boolean}); // Error: number ~> boolean

(Object.assign(
  {},
  ...[{a: 1}, {b: 'foo'}],
  ...[{c: true}],
): {a: number, b: true, c: boolean}); // Error: 'foo' => true
