/* @flow */

// ===================== //
// == Path Resolution == //
// ===================== //

// @providesModule
import * as DefaultA from "A";
var a1: number = DefaultA.numberValue1;
var a2: string = DefaultA.numberValue1; // Error: number ~> string

// File path
import * as DefaultB from "./B";
var b1: number = DefaultB.numberValue;
var b2: string = DefaultB.numberValue; // Error: number ~> string

// C.js exists, but not as a providesModule
import DefaultC from "C"; // Error: No such module

// @providesModule D exists, but not as a filename
import DefaultD from "./D"; // Error: No such module

// ================================================ //
// == CommonJS Clobbering Literal Exports -> ES6 == //
// ================================================ //

import {doesntExist1} from "CommonJS_Clobbering_Lit"; // Error: Not an exported binding

import {numberValue1} from "CommonJS_Clobbering_Lit";
var c1: number = numberValue1;
var c2: string = numberValue1; // Error: number ~> string

import {numberValue2 as numVal1} from "CommonJS_Clobbering_Lit";
var d1: number = numVal1;
var d2: string = numVal1; // Error: number ~> string

import CJS_Clobb_Lit from "CommonJS_Clobbering_Lit";
var e1: number = CJS_Clobb_Lit.numberValue3;
var e2: string = CJS_Clobb_Lit.numberValue3; // Error: number ~> string
CJS_Clobb_Lit.doesntExist; // Error: doesntExist isn't a property

import * as CJS_Clobb_Lit_NS from "CommonJS_Clobbering_Lit";
var f1: number = CJS_Clobb_Lit_NS.numberValue4;
var f2: number = CJS_Clobb_Lit_NS.default.numberValue4;
CJS_Clobb_Lit_NS.default.default; // Error: No 'default' property on the exported obj
var f3: string = CJS_Clobb_Lit_NS.numberValue4; // Error: number ~> string
var f4: string = CJS_Clobb_Lit_NS.default.numberValue5; // Error: number ~> string

// ============================================== //
// == CommonJS Clobbering Class Exports -> ES6 == //
// ============================================== //

import {doesntExist2} from "CommonJS_Clobbering_Class"; // Error: Not an exported binding

// The following import should error because class statics are not turned into
// named exports for now. This avoids complexities with polymorphic static
// members (where the polymophism is defined on the class itself rather than the
// method).
import {staticNumber1, baseProp, childProp} from "CommonJS_Clobbering_Class"; // Error

import CJS_Clobb_Class from "CommonJS_Clobbering_Class";
new CJS_Clobb_Class();
new CJS_Clobb_Class().doesntExist; // Error: Class has no `doesntExist` property
var h1: number = CJS_Clobb_Class.staticNumber2();
var h2: string = CJS_Clobb_Class.staticNumber2(); // Error: number ~> string
var h3: number = new CJS_Clobb_Class().instNumber1();
var h4: string = new CJS_Clobb_Class().instNumber1(); // Error: number ~> string

import * as CJS_Clobb_Class_NS from "CommonJS_Clobbering_Class";
new CJS_Clobb_Class_NS(); // Error: Namespace object isn't constructable
var i1: number = CJS_Clobb_Class_NS.staticNumber3(); // Error: Class statics not copied to Namespace object
var i2: number = new CJS_Clobb_Class_NS.default().instNumber2();
var i3: string = new CJS_Clobb_Class_NS.default().instNumber2(); // Error: number ~> string

// =================================== //
// == CommonJS Named Exports -> ES6 == //
// =================================== //

import {doesntExist3} from "CommonJS_Named"; // Error: Not an exported binding

import {numberValue2} from "CommonJS_Named";
var j1: number = numberValue2;
var j2: string = numberValue2; // Error: number ~> string

import {numberValue3 as numVal3} from "CommonJS_Named";
var k1: number = numVal3;
var k2: string = numVal3; // Error: number ~> string

import * as CJS_Named from "CommonJS_Named";
var l1: number = CJS_Named.numberValue1;
var l2: string = CJS_Named.numberValue1; // Error: number ~> string
CJS_Named.doesntExist; // Error: doesntExist isn't a property

import * as CJS_Named_NS from "CommonJS_Named";
var m1: number = CJS_Named_NS.numberValue4;
var m2: string = CJS_Named_NS.default.numberValue4; // Error: CommonJS_Named has no default export
var m3: string = CJS_Named_NS.numberValue4; // Error: number ~> string

//////////////////////////////
// == ES6 Default -> ES6 == //
//////////////////////////////

import {doesntExist4} from "ES6_Default_AnonFunction1"; // Error: Not an exported binding

import ES6_Def_AnonFunc1 from "ES6_Default_AnonFunction1";
var n1: number = ES6_Def_AnonFunc1();
var n2: string = ES6_Def_AnonFunc1(); // Error: number ~> string

import ES6_Def_NamedFunc1 from "ES6_Default_NamedFunction1";
var o1: number = ES6_Def_NamedFunc1();
var o2: string = ES6_Def_NamedFunc1(); // Error: number ~> string





import ES6_Def_NamedClass1 from "ES6_Default_NamedClass1";
var q1: number = new ES6_Def_NamedClass1().givesANum();
var q2: string = new ES6_Def_NamedClass1().givesANum(); // Error: number ~> string

////////////////////////////
// == ES6 Named -> ES6 == //
////////////////////////////

import doesntExist5 from "ES6_Named1"; // Error: Not an exported binding

import {specifierNumber1 as specifierNumber1_1} from "ES6_Named1";
var r1: number = specifierNumber1_1;
var r2: string = specifierNumber1_1; // Error: number ~> string

import {specifierNumber2Renamed} from "ES6_Named1";
var s1: number = specifierNumber2Renamed;
var s2: string = specifierNumber2Renamed; // Error: number ~> string

import {specifierNumber3 as specifierNumber3Renamed} from "ES6_Named1";
var t1: number = specifierNumber3Renamed;
var t2: string = specifierNumber3Renamed; // Error: number ~> string

import {groupedSpecifierNumber1, groupedSpecifierNumber2} from "ES6_Named1";
var u1: number = groupedSpecifierNumber1;
var u2: number = groupedSpecifierNumber2;
var u3: string = groupedSpecifierNumber1; // Error: number ~> string
var u4: string = groupedSpecifierNumber2; // Error: number ~> string

import {givesANumber} from "ES6_Named1";
var v1: number = givesANumber();
var v2: string = givesANumber(); // Error: number ~> string

import {NumberGenerator} from "ES6_Named1";
var w1: number = new NumberGenerator().givesANumber();
var w2: string = new NumberGenerator().givesANumber(); // Error: number ~> string

import {varDeclNumber1, varDeclNumber2} from "ES6_Named1";
var x1: number = varDeclNumber1;
var x2: number = varDeclNumber2;
var x3: string = varDeclNumber1; // Error: number ~> string
var x4: string = varDeclNumber2; // Error: number ~> string









import {numberValue1 as numberValue4} from "ES6_ExportFrom_Intermediary1";
var aa1: number = numberValue4;
var aa2: string = numberValue4; // Error: number ~> string

import {numberValue2_renamed} from "ES6_ExportFrom_Intermediary1";
var ab1: number = numberValue2_renamed;
var ab2: string = numberValue2_renamed; // Error: number ~> string

import {numberValue1 as numberValue5} from "ES6_ExportAllFrom_Intermediary1";
var ac1: number = numberValue5;
var ac2: string = numberValue5; // Error: number ~> string

///////////////////////////////////
// == ES6 Default -> CommonJS == //
///////////////////////////////////

require('ES6_Default_AnonFunction2').doesntExist; // Error: 'doesntExist' isn't an export

var ES6_Def_AnonFunc2 = require("ES6_Default_AnonFunction2").default;
var ad1: number = ES6_Def_AnonFunc2();
var ad2: string = ES6_Def_AnonFunc2(); // Error: number ~> string

var ES6_Def_NamedFunc2 = require("ES6_Default_NamedFunction2").default;
var ae1: number = ES6_Def_NamedFunc2();
var ae2: string = ES6_Def_NamedFunc2(); // Error: number ~> string





var ES6_Def_NamedClass2 = require("ES6_Default_NamedClass2").default;
var ag1: number = new ES6_Def_NamedClass2().givesANum();
var ag2: string = new ES6_Def_NamedClass2().givesANum(); // Error: number ~> string

/////////////////////////////////
// == ES6 Named -> CommonJS == //
/////////////////////////////////

var specifierNumber4 = require("ES6_Named2").specifierNumber4;
var ah1: number = specifierNumber4;
var ah2: string = specifierNumber4; // Error: number ~> string

var specifierNumber5Renamed = require("ES6_Named2").specifierNumber5Renamed;
var ai1: number = specifierNumber5Renamed;
var ai2: string = specifierNumber5Renamed; // Error: number ~> string

var groupedSpecifierNumber3 = require("ES6_Named2").groupedSpecifierNumber3;
var groupedSpecifierNumber4 = require("ES6_Named2").groupedSpecifierNumber4;
var aj1: number = groupedSpecifierNumber3;
var aj2: number = groupedSpecifierNumber4;
var aj3: string = groupedSpecifierNumber3; // Error: number ~> string
var aj4: string = groupedSpecifierNumber4; // Error: number ~> string

var givesANumber2 = require("ES6_Named2").givesANumber2;
var ak1: number = givesANumber2();
var ak2: string = givesANumber2(); // Error: number ~> string

var NumberGenerator2 = require("ES6_Named2").NumberGenerator2;
var al1: number = new NumberGenerator2().givesANumber();
var al2: string = new NumberGenerator2().givesANumber(); // Error: number ~> string

var varDeclNumber3 = require("ES6_Named2").varDeclNumber3;
var varDeclNumber4 = require("ES6_Named2").varDeclNumber4;
var am1: number = varDeclNumber3;
var am2: number = varDeclNumber4;
var am3: string = varDeclNumber3; // Error: number ~> string
var am4: string = varDeclNumber4; // Error: number ~> string









var numberValue6 = require("ES6_ExportFrom_Intermediary2").numberValue1;
var ap1: number = numberValue6;
var ap2: string = numberValue6; // Error: number ~> string

var numberValue2_renamed2 = require("ES6_ExportFrom_Intermediary2").numberValue2_renamed2;
var aq1: number = numberValue2_renamed2;
var aq2: string = numberValue2_renamed2; // Error: number ~> string

var numberValue7 = require("ES6_ExportAllFrom_Intermediary2").numberValue2;
var ar1: number = numberValue7;
var ar2: string = numberValue7; // Error: number ~> string

////////////////////////////////////////////////////////
// == ES6 Default+Named -> ES6 import Default+Named== //
////////////////////////////////////////////////////////

import defaultNum, {str as namedStr} from "./ES6_DefaultAndNamed";

var as1: number = defaultNum;
var as2: string = defaultNum; // Error: number ~> string

var as3: string = namedStr;
var as4: number = namedStr; // Error: string ~> number

////////////////////////////////////////
// == Side-effect only ES6 imports == //
////////////////////////////////////////

import "./SideEffects";

//////////////////////////////////////////////
// == Suggest export name on likely typo == //
//////////////////////////////////////////////
import specifierNumber1 from "ES6_Named1"; // Error: Did you mean `import {specifierNumber1} from ...`?
import {specifierNumber} from "ES6_Named1"; // Error: Did you mean `specifierNumber1`?

///////////////////////////////////////////////////
// == Multi `export *` should combine exports == //
///////////////////////////////////////////////////
import {
  numberValue1 as numberValue8,
  numberValue2 as numberValue9
} from "./ES6_ExportAllFromMulti";

var at1: number = numberValue8;
var at2: string = numberValue8; // Error: number ~> string

var at3: number = numberValue9;
var at4: string = numberValue9; // Error: number ~> string
