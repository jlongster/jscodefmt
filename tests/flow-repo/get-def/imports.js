// @flow

import thing from "./helpers/exports_default.js";
thing;

import {foo, bar as baz} from "./helpers/exports_named.js";
foo;
baz;

import * as things from "./helpers/exports_named.js";
things;
