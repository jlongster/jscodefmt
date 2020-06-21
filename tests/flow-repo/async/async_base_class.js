// This is kind of weird, but it should parse. This works in babel without the
// parens around (await promise). From the es6 and async/await specs I (nmote)
// am not clear on whether it should. In any case it's a strange corner case
// that is probably not important to support.
class C {};

var P: Promise<Class<C>> = new Promise(function (resolve, reject) {
  resolve(C);
});

async function foo() {
  class Bar extends (await P) { }
  return Bar;
}
