var o = {
  foo: 'bar'
};
o = {...o};
(o: {foo: string});

var p = {
  foo: 'bar'
};
(p: {foo: string; abc: string}); // error, p doesn't have `abc` yet
p = {...p, abc: 'def'};
(p: {foo: string; abc: string});

var q = {
  foo: 'bar'
};
for (var i = 0; i < 10; i++) {
  q = {...q};
}
(q: {foo: string});
