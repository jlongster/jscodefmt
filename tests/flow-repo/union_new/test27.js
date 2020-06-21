// @noflow

type X = ({a:true} & {b:string}) | ({a:false} & {c:string});
//type X = {a:true, b:string} | {a:false, c:string}; // this works.

function hello1(x:X): string {
  if (x.a === true) return x.b; else return x.c;
}

function hello2(x:X): string {
  if (x.a === false) return x.c; else return x.b;
}

function hello3(x:X): string {
  if (x.a) { return x.b; } else { return x.c; }
}

function hello4(x:X): string {
  if (!x.a) { return x.c; } else { return x.b; }
}
