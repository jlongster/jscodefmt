/* @flow */

(([]: Array<string>): Iterable<?string>); // ok, Iterable<+T>

(([]: Array<string>).values(): Iterable<?string>); // ok, Iterator<+T>
