// The following declare classes use `this` types effectively to avoid type
// errors in ../lib_client.js. If support for `this` types in declare classes
// is disabled for perf reasons, these will produce warnings.

declare class LinkedList {
  next(): this;
}
declare class DoublyLinkedList extends LinkedList {
  prev(): this;
}

declare module "mini-immutable" {
  declare class Map<K,V> {
    set(key: K, value: V): this; // more precise than Map<K,V> (see below)
  }
  declare class OrderedMap<K,V> extends Map<K,V> {
    // inherits set method returning OrderedMap<K,V> instead of Map<K,V>
  }
}
