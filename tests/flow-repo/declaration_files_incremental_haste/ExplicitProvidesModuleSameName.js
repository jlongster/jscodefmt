/*
 * @providesModule ExplicitProvidesModuleSameName
 * @flow
 */

class Implementation {}
module.exports.fun = (): Implementation => new Implementation;
