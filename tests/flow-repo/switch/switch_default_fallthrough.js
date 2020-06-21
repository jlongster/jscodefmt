/**
 * @flow
 */
function foo(x : mixed): string {
    var a = "";
    var b = "";

    switch (x) {
      case "foo":
        a = 0;
      default:
        b = 0;
    }

    // a is now string | number
    (a : string); // error, string | number ~/> string
    (a : number); // error, string | number ~/> number

    // b is now number
    (b : number); // ok
    return b; // error, number ~/> string
}

function baz(x: mixed): number {
    var a = "";
    var b = "";

    switch (x) {
      case "baz":
        a = 0;
        break;
      case "bar":
        a = "";
      default:
        b = 0;
    }

    // a is now string | number
    (a : string); // error, string | number ~/> string
    (a : number); // error, string | number ~/> number

    // b is now string | number
    (b : string); // error, string | number ~/> string
    (b : number); // error, string | number ~/> number

    return a+b; // error, string ~/> number
}
