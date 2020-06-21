//@flow
f<T>();
f<T><U></U>;
new C<T>;
f<T>(e);
o[e]<T>();
f<T>(x)<U>(y);
async <T>() => {};
async <T>(): T => {}
new C<T>(e);
f<T>[e];
new C<T>();
o.m<T>();
f<T>.0;
o?.m<T>(e);
o.m?.<T>(e);
async<T>();
f?.<T>(e);
