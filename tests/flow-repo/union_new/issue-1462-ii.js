type Common = {
};

type A = {
  type: 'A',
  foo: number
} & Common;

type B = {
  type: 'B',
  foo: Array<number>
} & Common;

type MyType = A | B;


function print(x: number) {
  console.log(x);
}

function printAll(val: MyType) {
  if (val.type === 'A') {
    print(val.foo);
  } else {
    val.foo.forEach(print);
  }
}
