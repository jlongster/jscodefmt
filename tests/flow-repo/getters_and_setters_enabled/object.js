/**
 * @flow
 */

var z: number = 123;

class A {}
class B extends A {}
class C extends A {}

var obj = {
  get goodGetterNoAnnotation() { return 4; },
  get goodGetterWithAnnotation(): number { return 4; },

  set goodSetterNoAnnotation(x) { z = x; },
  set goodSetterWithAnnotation(x: number) { z = x; },

  get propWithMatchingGetterAndSetter(): number { return 4; },
  set propWithMatchingGetterAndSetter(x: number) { },

  // The getter and setter need not have the same type
  get propWithSubtypingGetterAndSetter(): ?number { return 4; }, // OK
  set propWithSubtypingGetterAndSetter(x: number) { },

  set propWithSubtypingGetterAndSetterReordered(x: number) { }, // OK
  get propWithSubtypingGetterAndSetterReordered(): ?number { return 4; },

  get exampleOfOrderOfGetterAndSetter(): A { return new A(); },
  set exampleOfOrderOfGetterAndSetter(x: B) {},

  set exampleOfOrderOfGetterAndSetterReordered(x: B) {},
  get exampleOfOrderOfGetterAndSetterReordered(): A { return new A(); },

  set [z](x: string) {},
  get [z](): string { return string; },
};



// Test getting properties with getters
var testGetterNoError1: number = obj.goodGetterNoAnnotation;
var testGetterNoError2: number = obj.goodGetterWithAnnotation;

var testGetterWithError1: string = obj.goodGetterNoAnnotation; // Error number ~> string
var testGetterWithError2: string = obj.goodGetterWithAnnotation; // Error number ~> string

// Test setting properties with getters
obj.goodSetterNoAnnotation = 123;
obj.goodSetterWithAnnotation = 123;

obj.goodSetterNoAnnotation = "hello"; // Error string ~> number
obj.goodSetterWithAnnotation = "hello"; // Error string ~> number

var testSubtypingGetterAndSetter: number = obj.propWithSubtypingGetterAndSetter; // Error ?number ~> number

// When building this feature, it was tempting to flow the setter into the
// getter and then use either the getter or setter as the type of the property.
// This example shows the danger of using the getter's type
obj.exampleOfOrderOfGetterAndSetter = new C(); // Error C ~> B

// And this example shows the danger of using the setter's type.
var testExampleOrOrderOfGetterAndSetterReordered: number =
  obj.exampleOfOrderOfGetterAndSetterReordered; // Error A ~> B
