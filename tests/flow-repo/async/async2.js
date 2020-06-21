// @flow

// misc basic

function test1() {
  async function foo() {
    return 42;
  }

  async function bar() {
    var a = await foo();
    var b: number = a; // valid
    var c: string = a; // Error: number ~> string
  }
}

//
// void returns:
//

// inference should produce return type Promise<void>
// in the absence of an explicit return
//

function test2() {
  async function voidoid1() {
    console.log("HEY");
  }

  var voidoid2: () => Promise<void> = voidoid1; // ok

  var voidoid3: () => void = voidoid1; // error, void != Promise<void>
}

// annotated return type of Promise<void> should work
//

function test3() {
  async function voidoid4(): Promise<void> { // ok
    console.log("HEY");
  }
}

// other annotated return types should fail
// (note: misannotated return types with explicit
// return statements are covered in async.js)
//

function test4() {
  async function voidoid5(): void { // error, void != Promise<void>
    console.log("HEY");
  }
}

function test5() {
  async function voidoid6()
  : Promise<number> { // error, number != void
    console.log("HEY");
  }
}
