/* @flow */

declare function map<Tv, TNext>(
  obj: {[key: string]: Tv},
  iterator:((obj: Tv) => TNext),
): Array<TNext>;

/**
 * Tests overriding a property via a spread, where the value is a tvar. the
 * type of the prop from the object that is being overridden (`x.kind` in the
 * case below) should //not// feed back into the tvar (`value`), since the
 * result is a new object.
 */
function test(
  x: {kind: ?string},
  kinds: {[key: string]: string}
): Array<{kind: ?string}> {
  return map(kinds, (value) => {
    (value: string); // OK
    return {
      ...x,
      kind: value,
    };
  });
}
