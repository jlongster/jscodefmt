/**
 * Test resolution precedence in node:
 * checked module > lib def > unchecked module
 *
 * @flow
 */

// node_modules/buffer/index.js is unchecked,
// so we shouldn't pick up its boolean redefinition of INSPECT_MAX_BYTES
//
var buffer = require("buffer");
var b: boolean = buffer.INSPECT_MAX_BYTES; // error, number ~/> boolean

// node_modules/crypto/index.js is checked,
// so we should pick up its boolean redefinition of DEFAULT_ENCODING
//
var crypto = require("crypto");
var b: boolean = crypto.DEFAULT_ENCODING; // no error, we've overridden

// names that are explicit paths shouldn't fall back to lib defs
//
var buffer2 = require("./buffer");
var x2: string = buffer2.INSPECT_MAX_BYTES; // error, module not found

var buffer3 = require("./buffer.js");
var x3: string = buffer3.INSPECT_MAX_BYTES; // error, module not found
