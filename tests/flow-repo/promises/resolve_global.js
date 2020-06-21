/**
 * test Promise name resolution
 * @flow
 */

/**
 * 1. introduce shadowing bindings for important names
 */
class Promise {}

/**
 * 2. implicit refs to Promise during desugaring should be unaffected
 */
async function foo(x: boolean) {
  if (x) {
    return {bar: 'baz'};
  } else {
    return null;
  }
}

async function run() {
  console.log(await foo(true));
  console.log(await foo(false));
}

run();

/**
 * 3. but explicit name refs from code and annos resolve
 * using the usual rules
 */
// error: `Promise` in return expr is the local binding
async function bar() {
  return Promise.resolve(0);
}

// error: return type anno is a ref to the local binding
async function baz(): Promise<number> {
  return 0;
}
