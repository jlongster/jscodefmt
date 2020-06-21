/* @flow */

var Implicit = require('ImplicitProvidesModule');
(Implicit.fun(): string);

var ExplicitSameName = require('ExplicitProvidesModuleSameName');
(ExplicitSameName.fun(): string);

var ExplicitDifferentName = require('ExplicitProvidesModuleDifferentName');
(ExplicitDifferentName.fun(): string);
