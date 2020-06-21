var o = require('./test');

o.foo = function (params) {
  return params.count; // error, number ~/~ string
}
