/**
 * @flow
 */

requireLazy(['A', 'B'], function(A, B) {
  var num1: number = A.numberValueA;
  var str1: string = A.stringValueA;
  var num2: number = A.stringValueA; // Error: string ~> number
  var str2: string = A.numberValueA; // Error: number ~> string

  var num3: number = B.numberValueB;
  var str3: string = B.stringValueB;
  var num4: number = B.stringValueB; // Error: string ~> number
  var str4: string = B.numberValueB; // Error: number ~> string
});

var notA: Object = A;
var notB: Object = B;

requireLazy(); // Error: No args
requireLazy([nope], function() {}); // Error: Non-stringliteral args
requireLazy(['A']); // Error: No callback expression
