// @flow

type X = ({a:true} & {b:string}) | ({a:false} & {c:string});
//type X = {a:true, b:string} | {a:false, c:string}; // this works.

function hello(x:X): string {
  if (x.a === true) return x.b; else return x.c;
}
