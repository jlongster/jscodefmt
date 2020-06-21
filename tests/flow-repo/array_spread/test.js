var A = [1,2,3];
var B = [...A];
var C = [1,2,3];
B.sort((a, b) => a - b);
C.sort((a, b) => a - b);

var x: Array<string> = ['1', '2'];
var y: Array<string> = ['3', ...x];
