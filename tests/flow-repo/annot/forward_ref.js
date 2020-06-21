let myClassInstance: MyClass = null; // forward ref ok, null ~> class error

function bar(): MyClass {
  return null; // forward ref ok, null ~> class error
}

class MyClass { } // looked up above

function foo() {
  let myClassInstance: MyClass = mk(); // ok (no confusion across scopes)
  function mk() { return new MyClass(); }

  class MyClass { } // looked up above
}
