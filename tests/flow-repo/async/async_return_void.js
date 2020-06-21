// @flow

async function foo1(): Promise<string> {
  return;
}

async function foo2(): Promise<string> {
  return undefined;
}

async function foo3(): Promise<string> {
  function bar() { }
  return bar();
}
