// @flow
function foo(a,b,c) {
  switch (c) {
  case a.x.y: // OK
  case b.x.y: // OK
    return;
  default:
    return;
  }
}

// test refis out of switches that are exhaustive without default case

function exhaustion1(x): number {
  var foo;
  switch (x) {
  case 0: // falls through
  case 1:
    foo = 3;
    break;
  default:
    throw new Error('Invalid state');
  }
  return foo; // no error
}

function exhaustion2(x, y): number {
  var foo;
  switch (x) {
  case 0:
    if (y) {
      break;  // leaks uninitialized foo out of switch
    }
    /**
     * TODO this shouldn't cause an error, because the path that
     * runs it will always go on to assign a number to foo. But
     * we'll need true isolation in env snapshots to model this.
     * Currently tvars are always shared between clones - we'd
     * have to rework envs pretty extensively to avoid it.
     *
    foo = "";
     */
  case 1:
    foo = 3;
    break;
  default:
    throw new Error('Invalid state');
  }
  return foo; // error, possibly uninitialized
}

function exhaustion3(x): number {
  let foo = null;
  switch (x) {
  case 0: // falls through
  case 1:
    foo = 3;
    break;
  default:
    throw new Error('Invalid state');
  }
  return foo; // no error
}
