// You should be able to use an arrow function as an object with a call property

var a: { (x: number): string } = (x) => x.toString()

// ...and it should notice when the return type is wrong
var b: { (x: number): number } = (x) => "hi"

// ...or if the param type is wrong
var c: { (x: string): string } = (x) => x.toFixed()

// ...or if the arity is wrong
var d: { (): string } = (x) => "hi"

// ...but subtyping rules still apply
var e: { (x: any): void } = () => { } // arity
var f: { (): mixed } = () => "hi" // return type
var g: { (x: Date): void } = (x) => { x * 2 } // param type (date < number)

// A function can be an object
var y : {} = (x) => "hi"
var z : Object = (x) => "hi"
