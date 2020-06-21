// @flow

/*
   object literals are sealed. this is simply a heuristic
   decision: most of the time, the rule gives the 'right'
   errors.

   an exception is when a literal is used as an initializer
   for an lvalue whose type specifies optional properties
   missing from the literal, as below.

   the problem becomes visible when a property assignment
   is then used to (legitimately) extend the object with an
   optional property - the variable's specific (path-
   dependent) type has become that of the literal which.
   without adjustment, will reject the property addition.

   the solution in cases where a sealed object type (as from
   an object literal) flows to an object type with optional
   properties, is to have the sealed type acquire the optional
   properties.
 */

// x has optional property b.
// (note that the initializer here does not play into
// the problem, it's just a placeholder. initializers
// do not narrow the types of annotated variables as do
// subsequent assignments.)
//
var x: { a: number, b?: number } = { a: 0 };

// now assign an object literal lacking property b.
// the literal's type is sealed and has only a at creation.
// but it then flows, specific ~> general, to x's annotation
// type. at that point, it acquires b as an optional property.
//
x = { a: 0 };

// ...which allows this assignment to take place.
x.b = 1;

// T7810506
class A {
    x: { a: number, b?: string };
    foo() {
        // Something similar should happen here, but doesn't: the problem is
        // made explicit by adding generics (see test3_failure.js introduced by
        // D2747512). There is a race between writing b on the object literal
        // type and adding b as an optional property to it, since in general we
        // cannot guarantee that the flow from the object literal to the
        // annotation will be processed before the flow involving the
        // access. Here we lose the race and get an error on the write.
        this.x = { a: 123 };
        this.x.b = 'hello';
    }
}
