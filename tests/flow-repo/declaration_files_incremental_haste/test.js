/* @flow */

var Implicit = require('ImplicitProvidesModule');
(Implicit.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean

var ExplicitSameName = require('ExplicitProvidesModuleSameName');
(ExplicitSameName.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean

var ExplicitDifferentName = require('ExplicitProvidesModuleDifferentName');
(ExplicitDifferentName.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean
