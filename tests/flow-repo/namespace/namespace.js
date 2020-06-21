/*@flow*/// import type { T } from '...'
type T = (x:number) => void;
var f: T = function(x:string): void { }

type Map<X,Y> = (x:X) => Y;

function bar<U,V>(x:U, f:Map<U,V>): V {
    return f(x);
}

var y:number = bar(0, x => "");

type Seq = number | Array<Seq>;
var s1:Seq = [0,[0]];
var s2:Seq = [[""]];

module.exports = { foo: ("": number) };
