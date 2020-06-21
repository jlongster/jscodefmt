declare function promiseAllByKey<O>(o: O): Promise<$ObjMap<O,typeof $await>>;
declare function keyMirror<O>(o: O): $ObjMapi<O, <K>(k:K) => K>;

var o = keyMirror({
  FOO: null,
  BAR: null,
});

(o.FOO : 'FOO'); // ok
(o.FOO : 'BAR'); // error, 'FOO' incompatible with 'BAR'

promiseAllByKey({
  foo: Promise.resolve(0),
  bar: 'bar',
}).then(o => {
  (o.foo: string); // error, number ~> string
  (o.bar: 'bar'); // ok
});
