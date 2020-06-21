/* @flow */

//
// Imports
//

// CommonJS module
import * as DefaultA from "A";
DefaultA.numberValue1 = 123; // Error: DefaultA is frozen

// ES6 module
import * as ES6_Named1 from "ES6_Named1";
ES6_Named1.varDeclNumber1 = 123; // Error: ES6_Named1 is frozen

// CommonJS module that clobbers module.exports
import * as CommonJS_Star from "CommonJS_Clobbering_Lit";
CommonJS_Star.numberValue1 = 123; // Error: frozen
CommonJS_Star.default.numberValue1 = 123; // ok

import CommonJS_Clobbering_Lit from "CommonJS_Clobbering_Lit";
CommonJS_Clobbering_Lit.numberValue1 = 123; // ok

// CommonJS module that clobbers module.exports with a frozen object
import * as CommonJS_Frozen_Star from "CommonJS_Clobbering_Frozen";
CommonJS_Frozen_Star.numberValue1 = 123; // Error: frozen
CommonJS_Frozen_Star.default.numberValue1 = 123; // Error: frozen

import CommonJS_Clobbering_Frozen from "CommonJS_Clobbering_Frozen";
CommonJS_Clobbering_Frozen.numberValue1 = 123; // Error: exports are frozen


//
// Requires
//

function testRequires() {
  // CommonJS module
  var DefaultA = require("A");
  DefaultA.numberValue1 = 123; // ok, not frozen by default

  // ES6 module
  var ES6_Named1 = require("ES6_Named1");
  ES6_Named1.numberValue = 123; // error, es6 exports are frozen

  // CommonJS module that clobbers module.exports
  var CommonJS_Star = require("CommonJS_Clobbering_Lit");
  CommonJS_Star.numberValue1 = 123; // ok, not frozen by default

  // CommonJS module that clobbers module.exports with a frozen object
  var CommonJS_Frozen_Star = require("CommonJS_Clobbering_Frozen");
  CommonJS_Frozen_Star.numberValue1 = 123; // Error: frozen
}
