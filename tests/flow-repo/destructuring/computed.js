var { ["key"]: val1 } = { key: "val" };
(val1: void); // error: string ~> void

var key: string = "key";
var { [key]: val2 } = { key: "val" };
(val2: void); // ok (gasp!) by existing StrT -> ElemT rule

var { ["key"]: val3, ...spread } = { key: "val" };
(spread.key: void); // error (gasp!) in general we don't know if a computed prop should be excluded from spread
