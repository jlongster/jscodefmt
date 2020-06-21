/**
 * @flow
 */

interface IHasXString {
  x: string;
}

var propTest1: IHasXString = { x: 'hello' };
var propTest2: IHasXString = { x: 123 }; // Error string != number
var propTest3: IHasXString = {}; // Property not found
var propTest4: IHasXString = ({}: Object);

function propTest5(y: {[key: string]: string}) {
  (y: IHasXString); // OK
}

function propTest6(y: {[key: string]: number}) {
  (y: IHasXString); // error: string != number
}
