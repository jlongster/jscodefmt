/* @flow */

function num(x:number) { }

num(null * 1);
num(1 * null);

let x: number = 2 * 3;
x *= 4;

let y: string = "123";
y *= 2; // error
