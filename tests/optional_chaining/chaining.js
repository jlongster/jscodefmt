var street = user.address?.street
var fooValue = myForm.querySelector('input[name=foo]')?.value

obj?.prop;
obj?.[expr];
func?.(...args);

a?.();
a?.[++x];
a?.b.c(++x).d;
a?.b[3].c?.(x).d;
a?.b.c;
(a?.b).c;
a?.b?.c;
delete a?.b;

a?.b[3].c?.(x).d.e?.f[3].g?.(y).h;

(a?.b).c();
(a?.b[c]).c();

(a?.b)?.c.d?.e;
(a ? b : c)?.d;

(list || list2)?.length;
(list || list2)?.[(list || list2)];

async function HelloWorld() {
  var x = (await foo.bar.blah)?.hi;
}

a[b?.c].d();
a?.[b?.c].d();
a[b?.c]?.d();
a?.[b?.c]?.d();
