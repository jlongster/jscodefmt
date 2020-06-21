/**
 * @providesModule ES6_Named1
 * @flow
 */

var specifierNumber1 = 1;
var specifierNumber2 = 2;
var specifierNumber3 = 3;
var groupedSpecifierNumber1 = 1;
var groupedSpecifierNumber2 = 2;

export {specifierNumber1};
export {specifierNumber2 as specifierNumber2Renamed};
export {specifierNumber3};
export {groupedSpecifierNumber1, groupedSpecifierNumber2};

export function givesANumber(): number { return 42; };
export class NumberGenerator { givesANumber(): number { return 42; }};

export var varDeclNumber1 = 1, varDeclNumber2 = 2;
export var {destructuredObjNumber} = {destructuredObjNumber: 1};
export var [destructuredArrNumber] = [1]
