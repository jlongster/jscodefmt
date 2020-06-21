enum E1 {
  A = 0,
  // B = 1,
  C = 2
}

enum E2 of number {
  // AA = -1,
  A = 0,
  // B = 1,
  C = 2
  // D = 100
}

enum E3 {/*Q*/}

enum E4 of /*Q*/ string {
  Foo = "foo"
}

enum E5 of string { // Q
  Bar = "bar"
}

enum /*Q*/ E6 of string {}
