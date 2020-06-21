/**
 * @providesModule ES6_Named2
 * @flow
 */

var specifierNumber4 = 1;
var specifierNumber5 = 2;
var groupedSpecifierNumber3 = 1;
var groupedSpecifierNumber4 = 2;

declare export {specifierNumber4};
declare export {specifierNumber5 as specifierNumber5Renamed};
declare export {groupedSpecifierNumber3, groupedSpecifierNumber4};

declare export function givesANumber2(): number;
declare export class NumberGenerator2 { givesANumber(): number; };

declare export var varDeclNumber3: number;
declare export var varDeclNumber4: number;
