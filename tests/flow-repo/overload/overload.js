/**
 * tests of overload selection
 *
 * @flow
 */

var x1: number = "".match(0)[0];
var x2: number = "".match(/pattern/)[0];
var x3: string = "".replace(/pattern/,"...");
var x4: number = "".split(/pattern/)[0];

declare class C {
    foo(x:number): number;
    foo(x:string): string;

    bar(x: { a: number }): number;
    bar(x: { a: string }): string;
}

var a = new C();

a.foo(0); // ok
a.foo("hey"); // ok
a.foo(true); // error, function cannot be called on intersection type

a.bar({ a: 0 }); // ok
a.bar({ a: "hey" }); // ok
a.bar({ a: true }); // error, function cannot be called on intersection type

declare var x: { a: boolean; } & { b: string };

a.bar(x); // error with nested intersection info (outer for bar, inner for x)

/********** tests **************
interface Dummy<T> {
    dumb(foo: (x:number) => number):number;
    dumb(foo: (x:string) => string):string;

    dumber<U>(bar: (x:T) => Array<U>):U;
    dumber<U>(bar: (x:T) => U):Array<U>;
}

function foo(x:string):string { return x; }
var y:number = new Dummy().dumb(foo);

function bar1(x:number):Array<string> { return []; }
var z1:number = new Dummy().dumber(bar1);

function bar2(x:number):string { return "..."; }
var z2:Array<string> = new Dummy().dumber(bar2);
*/
