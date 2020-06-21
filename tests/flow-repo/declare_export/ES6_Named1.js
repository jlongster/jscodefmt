/**
 * @providesModule ES6_Named1
 * @flow
 */

var specifierNumber1 = 1;
var specifierNumber2 = 2;
var specifierNumber3 = 3;
var groupedSpecifierNumber1 = 1;
var groupedSpecifierNumber2 = 2;

declare export {specifierNumber1};
declare export {specifierNumber2 as specifierNumber2Renamed};
declare export {specifierNumber3};
declare export {groupedSpecifierNumber1, groupedSpecifierNumber2};

declare export function givesANumber(): number;
declare export class NumberGenerator { givesANumber(): number; };

declare export var varDeclNumber1: number;
declare export var varDeclNumber2: number;
