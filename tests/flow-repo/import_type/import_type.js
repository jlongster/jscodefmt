/**
 * @flow
 */

/////////////////////////////////////////////////
// == Importing Class Type (Default Export) == //
/////////////////////////////////////////////////

import type ClassFoo1 from "./ExportDefault_Class";
import {foo1Inst} from "./ExportDefault_Class";

var a1: ClassFoo1 = foo1Inst;
var a2: number = foo1Inst; // Error: ClassFoo1 ~> number
new ClassFoo1(); // Error: ClassFoo1 is not a value-identifier

///////////////////////////////////////////////
// == Importing Class Type (Named Export) == //
///////////////////////////////////////////////

import type {ClassFoo2} from "./ExportNamed_Class";
import {foo2Inst} from "./ExportNamed_Class";

var b1: ClassFoo2 = foo2Inst;
var b2: number = foo2Inst; // Error: ClassFoo2 ~> number
new ClassFoo2(); // Error: ClassFoo2 is not a value-identifier

/////////////////////////////////////////////////////
// == Importing Class Type (CJS Default Export) == //
/////////////////////////////////////////////////////

import type ClassFoo3T from "./ExportCJSDefault_Class";
import ClassFoo3 from "./ExportCJSDefault_Class";
var c1: ClassFoo3T = new ClassFoo3();
new ClassFoo3T(); // Error: ClassFoo3 is not a value-identifier

///////////////////////////////////////////////////
// == Importing Class Type (CJS Named Export) == //
///////////////////////////////////////////////////

import type {ClassFoo4, ClassFoo5} from "./ExportCJSNamed_Class";
import {foo4Inst, foo5Inst} from "./ExportCJSNamed_Class";

var d1: ClassFoo4 = foo4Inst;
var d2: number = foo4Inst; // Error: ClassFoo4 ~> number
new ClassFoo4(); // Error: ClassFoo4 is not a value-identifier
// TODO: this errors correctly, but the message is just 'can't resolve name'
var d3: typeof ClassFoo5 = foo5Inst; // Error: Can't typeof a type alias

////////////////////////////////////////////
// == Import Type Alias (Named Export) == //
////////////////////////////////////////////

import type {AliasFoo3} from "./ExportNamed_Alias";
import {givesAFoo3Obj} from "./ExportNamed_Alias";
var e1: AliasFoo3 = givesAFoo3Obj();
var e2: number = givesAFoo3Obj(); // Error: AliasFoo3 ~> number
var e3: typeof AliasFoo3 = givesAFoo3Obj(); // Error: Can't typeof a type alias

//////////////////////////////////////////////
// == Import Type Alias (Default Export) == //
//////////////////////////////////////////////

// TODO: No support for this right now. It's most likely possible, but it's
//       unclear how useful it is at the moment and it entails a little
//       more work than named type exports, so I'm punting on it for now.

///////////////////////////////////////////////////////
// == Import Type With Non-Alias Compatible Value == //
///////////////////////////////////////////////////////

import type {numValue} from "./ExportsANumber"; // Error: Cannot import-type a number value

////////////////////////////////////////////////////////////////////////
// == Regression Test: https://github.com/facebook/flow/issues/359 == //
// Ensure that type bindings stay type bindings across function body  //
// env contexts.                                                      //
////////////////////////////////////////////////////////////////////////

import type ClassFoo6 from "./issue-359";
function foo() {
  ClassFoo6; // Error: Not a value binding
}
