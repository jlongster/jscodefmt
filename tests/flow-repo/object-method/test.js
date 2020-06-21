const id = require('./id');

export type ObjectType = {
  +m: () => void,
};

function methodCaller(x: ObjectType) {
  x.m();
};

module.exports = id(
  methodCaller
);
