var hello = require('./test4');
var dummy = require('./test');
module.exports = {
  ...dummy,
  [hello]: 'world',
  ...dummy,
};
