/**
 * @flow
 */

function testArray(arr: Array<number>): void {
  for (var x of arr) {
    (x: string); // Error - number ~> string
  }
}

function testIterable1(iterable: Iterable<number>): void {
  for (var x of iterable) {
    (x: string); // Error - number ~> string
  }
}

function testIterable2(iterable: Iterable<*>): void {
  for (var x of iterable) {
    (x: string);
  }
}

function testString(str: string): void {
  for (var x of str) {
    (x: number); // Error - string ~> number
  }
}

function testMap1(map: Map<string, number>): void {
  for (var elem of map) {
    (elem: [string, number]);
    (elem: number); // Error - tuple ~> number
  }
}

function testMap2(map: Map<*, *>): void {
  for (var elem of map) {
    (elem: [number, string]); // Any tuple is fine
    (elem: number); // Error - tuple ~> number
  }
}

function testSet1(set: Set<string>): void {
  for (var x of set) {
    (x: number); // Error - string ~> number
  }
}

function testSet2(set: Set<*>): void {
  for (var x of set) {
    (x: number); // Anything goes
  }
}
