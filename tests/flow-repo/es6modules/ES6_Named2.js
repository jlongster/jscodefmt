/**
 * @providesModule ES6_Named2
 * @flow
 */

var specifierNumber4 = 1;
var specifierNumber5 = 2;
var groupedSpecifierNumber3 = 1;
var groupedSpecifierNumber4 = 2;

export {specifierNumber4};
export {specifierNumber5 as specifierNumber5Renamed};
export {groupedSpecifierNumber3, groupedSpecifierNumber4};

export function givesANumber2(): number { return 42; };
export class NumberGenerator2 { givesANumber(): number { return 42; }};

export var varDeclNumber3 = 1, varDeclNumber4 = 2;
export var {destructuredObjNumber2} = {destructuredObjNumber2: 1};
export var [destructuredArrNumber2] = [1]
