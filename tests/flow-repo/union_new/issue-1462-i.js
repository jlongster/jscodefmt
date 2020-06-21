type Common = {
};

type A = Common & {
  type: 'A',
  foo: number
};

type B = Common & {
  type: 'B',
  foo: Array<number>
}

type MyType = A | B;

function print(x: number) {
  console.log(x);
}

function printAll(val: MyType) {
  print(val.foo);  // <--- foo could be an array
}
