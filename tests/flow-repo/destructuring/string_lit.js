var { "key": val } = { key: "val" };
(val: void); // error: string ~> void

var { "with-dash": with_dash } = { "with-dash": "motivating example" };
(with_dash: "motivating example"); // ok
