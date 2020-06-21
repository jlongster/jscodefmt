/**
 * @flow
 */

// progressively annotate:

var o = { x: 0 }
//var o: {x: number;} = { x: 0 }

var x:string = o.x;

module.exports = o;
