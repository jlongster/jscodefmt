/* @flow */

// Local `exports` var is just a ref to module.exports, so mutating the original
// value will affect the exports object but re-binding it makes it useless and
// does not affect the exports value.
module.exports = {
  numberValue: 42
};

exports = {stringValue: ''};
