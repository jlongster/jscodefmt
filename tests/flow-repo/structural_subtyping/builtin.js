/**
 * @flow
 */

interface IHasLength {
  length: number;
}

var lengthTest1: IHasLength = [];
var lengthTest2: IHasLength = 'hello';
var lengthTest3: IHasLength = 123; // number doesn't have length
var lengthTest4: IHasLength = true; // bool doesn't have length
