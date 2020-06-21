/* @flow */

function setTest1(set: Set<string>): Iterable<string> {
  return set;
}
function setTest2<T>(set: Set<T>): Iterable<T> {
  return set;
};
function setTest3(set: Set<string>): Iterable<*> {
  return set;
}
// Error string ~> number
function setTest4(set: Set<string>): Iterable<number> {
  return set;
}
