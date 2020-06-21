var x = Boolean(4);
function foo(fn:(value:any)=>boolean) { }
foo(Boolean);

var dict: { [k: string]: any } = {};
dict(); // error, callable signature not found

interface ICall {
  (x: string): void;
}
declare var icall: ICall;
icall(0); // error, number ~> string
icall.call(null, 0); // error, number ~> string

type Callable = {
  (x: string): void;
}

declare var callable: Callable;
callable(0); // error, number ~> string
callable.call(null, 0); // error, number ~> string
