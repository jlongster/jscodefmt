// @flow

type A = {
  'b_c': ?string
};

function stuff(str: string) {}

function testProperty(a: A) {
  if (a.b_c) {
    stuff(a.b_c)
  }
}

function testLiteralProperty(a: A) {
  if (a['b_c']) {
    stuff(a['b_c'])
  }
}
