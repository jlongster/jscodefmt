/**
 * @flow
 */

var add = (x: number, y: number): number => x + y;

var bad = (x: number): string => x; // Error!

var ident = <T>(x: T): T => x;
(ident(1): number);
(ident("hi"): number); // Error
