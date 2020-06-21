/** @flow */
/* this require routes to nothing, because
   our node_modules/underscore directory
   has been excluded. If package.json files
   are being excluded properly, we'll get
   'Required module not found'.
 */
var _ = require('underscore');

function foo(): string {
  return _.foo();
}

module.exports = foo;
