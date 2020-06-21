/**
 * @flow
 */

class ClassWithXString {
  x: string;
}

interface IHasXString {
  x: string;
}

interface IHasXNumber {
  x: number;
}

interface IHasYString {
  y: string;
}

var testInstance1: IHasXString = new ClassWithXString();
var testInstance2: IHasXNumber = new ClassWithXString(); // Error wrong type
var testInstance3: IHasYString = new ClassWithXString(); // Error missing prop
