// @flow

function fun(x: 'hi', y: 123) {}
fun(...['hi', 123]); // No error
fun(...['hi'], ...[123]); // No error
fun(...['hi'], ...[], ...[123]); // No error
fun(...['hi'], ...[], ...[123], ...[true]); // Error - true is unused
fun(...['hi'], ...[true], ...[123]); // Error: true ~> 123 and 123 is unused

declare var arrOf123: Array<123>;
fun('hi', ...arrOf123); // No error - ignore the fact arrOf123 could be empty


function funWithRestArray(x: 'hi', y: 123, ...rest: Array<number>) {}
funWithRestArray(...['hi', 123]); // No error
funWithRestArray(...['hi'], ...[123]); // No error
funWithRestArray(...['hi'], ...[], ...[123]); // No error
funWithRestArray(...['hi'], ...[], ...[123], ...[456, 789]); // No error
funWithRestArray(...['hi'], ...[true], ...[123]); // Error: true ~> 123

funWithRestArray('hi', 123, ...arrOf123); // Ok
funWithRestArray('hi', ...arrOf123); // No error - ignore the fact arrOf123 could be empty
funWithRestArray('hi', ...arrOf123, ...arrOf123); // No error - ignore the fact arrOf123 could be empty

// 2 errors
// 1. 'bye' ~> 123 in case the first spread is empty
// 2. 'bye' ~> number in case the first spread is not empty
funWithRestArray('hi', ...arrOf123, 'bye', ...arrOf123);
