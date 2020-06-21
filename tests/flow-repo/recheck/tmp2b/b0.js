// @flow

class C { x: C; }
class E extends C { x: C; }

module.exports = { C, E };
