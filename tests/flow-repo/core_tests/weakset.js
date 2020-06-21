// @flow

let ws = new WeakSet();
let obj: Object = {};
let dict: {foo: string} = {foo: 'bar'};

ws.add(window);
ws.add(obj);
ws.add(dict);
ws.has(window);
ws.has(obj);
ws.has(dict);
ws.delete(window);
ws.delete(obj);
ws.delete(dict);

let ws2 = new WeakSet([obj, dict]);

let ws3 = new WeakSet([1, 2, 3]); // error, must be objects

function* generator(): Iterable<{foo: string}> {
  while (true) {
    yield {foo: 'bar'};
  }
}

let ws4 = new WeakSet(generator());

function* numbers(): Iterable<number> {
  let i = 0;
  while (true) {
    yield i++;
  }
}

let ws5 = new WeakSet(numbers()); // error, must be objects
