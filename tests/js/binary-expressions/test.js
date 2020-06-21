// It should always break the highest precedence operators first, and
// break them all at the same time.

const x = longVariable + longVariable + longVariable;
const x = longVariable + longVariable + longVariable + longVariable - longVariable + longVariable;
const x = longVariable + longVariable * longVariable + longVariable - longVariable + longVariable;
const x = longVariable + longVariable * longVariable * longVariable / longVariable + longVariable;

const x = longVariable && longVariable && longVariable && longVariable && longVariable && longVariable;
const x = longVariable && longVariable || longVariable && longVariable || longVariable && longVariable;
const x = firstItemWithAVeryLongNameThatKeepsGoing || firstItemWithAVeryLongNameThatKeepsGoing || {};
const x = firstItemWithAVeryLongNameThatKeepsGoing || firstItemWithAVeryLongNameThatKeepsGoing || [];
const x = call(firstItemWithAVeryLongNameThatKeepsGoing, firstItemWithAVeryLongNameThatKeepsGoing) || [];

const x = longVariable * longint && longVariable >> 0 && longVariable + longVariable;

const x = longVariable > longint && longVariable === 0 + longVariable * longVariable;

foo(obj.property * new Class() && obj instanceof Class && longVariable ? number + 5 : false);
