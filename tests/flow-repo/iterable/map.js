/* @flow */

function mapTest1(map: Map<string, number>): Iterable<[string, number]> {
  return map;
}
function mapTest2<K, V>(map: Map<K, V>): Iterable<[K, V]> {
  return map;
};
function mapTest3(map: Map<string, number>): Iterable<*> {
  return map;
}
// Error - Map is an Iterable<[K, V]>
function mapTest4(map: Map<number, string>): Iterable<string> {
  return map;
}
