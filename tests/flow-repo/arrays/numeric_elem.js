var arr = [];
var day = new Date;

// Date instances are numeric (see Flow_js.numeric) and thus can index into
// arrays.
arr[day] = 0;
(arr[day]: string); // error: number ~> string
