function block_scope(x: string | number) {
  {
    let x;
    x = ""; // doesn't refine outer x
  }
  (x : string); // error: number ~> string
}

function switch_scope(x: string | number) {
  switch (x) {
    default:
      let x;
      x = ""; // doesn't refine outer x
  }
  (x : string); // error: number ~> string
}

function try_scope(x: string | number) {
  try {
    let x;
    x = ""; // doesn't refine outer x
  } catch (e) {
    x = ""; // refinement would only escape if both sides refined
  }
  (x : string); // error: number ~> string
}

function try_scope_catch(x: string | number) {
  try {
    x = ""; // refinement would only escape if both sides refined
  } catch (e) {
    let x;
    x = ""; // doesn't refine outer x
  }
  (x : string); // error: number ~> string
}
