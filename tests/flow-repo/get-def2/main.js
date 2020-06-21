// @flow

var Parent = require('./Parent');

// Hops through destructuring
let ParentFoo;
({ParentFoo} = Parent);
ParentFoo; // Points to lval in line above this

// Follows assignment on simple/"non-destructuring" patterns
let ParentFoo2;
ParentFoo2 = Parent;
ParentFoo2; // Points to LHS of line above this

// Follows assignment with declaration
let ParentFoo3 = Parent;
ParentFoo3; // Points to LHS of line above this

// Follows non-destructured property access of `require('Parent')`
let foo = require('./Parent').ParentFoo.foo;
foo;

import type {Foo} from './types';
function takesFoo(foo: Foo) { }
