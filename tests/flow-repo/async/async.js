// @flow

// "For async functions, a Promise<T> is returned,
// and the type of return expressions must be T."
//

async function f0(): Promise<number> {
  return 1;
}

async function f1(): Promise<bool> {
  return 1;  // error, number != bool
}

// await: (p: Promise<T> | T) => T
//

async function f2(p: Promise<number>): Promise<number> {
  var x: number = await p;
  var y: number = await 1;
  return x + y;
}

async function f3(p: Promise<number>): Promise<number> {
  return await p;
}

// TODO: this is one of those bad generic errors, currently:
// "inconsistent use of library definitions" with two core.js locs
async function f4(p: Promise<number>): Promise<bool> {
  return await p; // error, number != bool
}

// async arrow functions
//

var f5: () => Promise<number> = async () => await 1;

// async methods
//

class C {
  async m() { return 1; }
  async mt<T>(a: T): Promise<T> { return a; }
  static async m(a): void { await a; } // error, void != Promise<void>
  static async mt<T>(a: T): Promise<T> { return a; }
}

// async function props

var obj = { f: async () => await 1 };
var objf : () => Promise<number> = obj.f;
