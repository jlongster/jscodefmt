declare class D {
  constructor(): { x: number }; // OK
  y: any;
}

var d = new D();
d.x = ""; // error, string ~/~ number (but property x is found)

(new D: D); // error, new D is an object, D not in proto chain

module.exports = D;
