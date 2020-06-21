function switch_scope(x: mixed) {
  let a = "";
  let b = "";
  switch (x) {
    case "foo":
      let a;
      a = 0; // doesn't add lower bound to outer a
      b = 0;
  }
  (a : string); // OK
  (b : string); // error: number ~> string
}

function try_scope_finally() {
  let a;
  let b;
  try {
    a = "";
    b = "";
  } finally {
    let a;
    a = 0; // doesn't add lower bound to outer a
    b = 0;
  }
  (a : string); // ok
  (b : string); // error: number ~> string
}

function for_scope() {
  let a = "";
  let b = "";
  for (let a;;) {
    a = 0; // doesn't add lower bound to outer a
    b = 0;
  }
  (a : string);
  (b : string); // error: number ~> string
}

function for_in_scope(o: Object) {
  let a = 0;
  let b = 0;
  for (let a in o) {
    a = ""; // doesn't add lower bound to outer a
    b = "";
  }
  (a : number);
  (b : number); // error: string ~> number
}

function for_of_scope(xs: number[]) {
  let a = "";
  let b = "";
  for (let a of xs) {
    a = 0; // doesn't add lower bound to outer a
    b = 0;
  }
  (a : string);
  (b : string); // error: number ~> string
}
