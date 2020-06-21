/**
 * @flow
 */

var z: number = 123;

declare class Foo {
  get goodGetterWithAnnotation(): number;
  set goodSetterWithAnnotation(x: number): void;

  get propWithMatchingGetterAndSetter(): number;
  set propWithMatchingGetterAndSetter(x: number): void;

  // The getter and setter need not have the same type - no error
  get propWithSubtypingGetterAndSetter(): ?number;
  set propWithSubtypingGetterAndSetter(x: number): void;

  // The getter and setter need not have the same type - no error
  set propWithSubtypingGetterAndSetterReordered(x: number): void;
  get propWithSubtypingGetterAndSetterReordered(): ?number;

  get propWithMismatchingGetterAndSetter(): number;
  set propWithMismatchingGetterAndSetter(x: string): void; // doesn't match getter (OK)

  propOverriddenWithGetter: number;
  get propOverriddenWithGetter(): string;

  propOverriddenWithSetter: number;
  set propOverriddenWithSetter(x: string): void;
};

var foo = new Foo();

// Test getting properties with getters
var testGetterNoError2: number = foo.goodGetterWithAnnotation;

var testGetterWithError2: string = foo.goodGetterWithAnnotation; // Error number ~> string

// Test setting properties with getters
foo.goodSetterWithAnnotation = 123;

foo.goodSetterWithAnnotation = "hello"; // Error string ~> number

var testSubtypingGetterAndSetter: number = foo.propWithSubtypingGetterAndSetter; // Error ?number ~> number

var testPropOverridenWithGetter: number = foo.propOverriddenWithGetter; // Error string ~> number
foo.propOverriddenWithSetter = 123; // Error number ~> string
