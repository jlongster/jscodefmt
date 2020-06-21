/*
 * @providesModule ExplicitProvidesModuleDifferentName
 * @flow
 */

class Implementation {}
module.exports.fun = (): Implementation => new Implementation;
