function foo():string { return null; }

function bar():?string { return null; }

function qux(x:string) { }

function corge(x:number) { }

var x = bar(); // x: ?string
if (x != null) qux(x); // x: ?string | null
if (x != null) corge(x); // x: ?string | null

function grault() { x = null; }
if (x != null) {
  grault(); qux(x);
}

var array_of_nullable: Array<?number> = [null, 3];
