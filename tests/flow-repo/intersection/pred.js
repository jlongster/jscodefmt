/**
 * Test interaction of object intersections and predicates.
 * Definitions in lib/lib.js
 *
 * @flow
 */

type DuplexStreamOptions = ReadableStreamOptions & WritableStreamOptions & {
  allowHalfOpen? : boolean,
  readableObjectMode? : boolean,
  writableObjectMode? : boolean
};

function hasObjectMode_bad(options: DuplexStreamOptions): boolean {
  return options.objectMode
    || options.readableObjectMode
    || options.writableObjectMode; // error, undefined ~> boolean
}

function hasObjectMode_ok(options: DuplexStreamOptions): boolean {
  return !!(options.objectMode
    || options.readableObjectMode
    || options.writableObjectMode);
}
