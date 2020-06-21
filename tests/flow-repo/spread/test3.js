var p = { y: "" };
var q = { z: "" };
var o = {
  x: 5,
  ...p,
  ...q,
};
var y: number = o.y;
var z: number = o.z;

// test conflicting keys (they get unioned)
var r = { y: 123 };
var s = {
  ...p,
  ...r,
};
var t: boolean = s.y; // error, string or number
