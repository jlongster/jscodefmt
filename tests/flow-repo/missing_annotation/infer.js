/* @flow */

var Foo = {
  a: function(arg) {  // missing arg annotation
    return arg;
  },

  b: function(arg) {  // missing arg annotation
    return {
      bar: arg
    };
  },

  c: function(arg: string) {  // no return annotation required
    return {
      bar: arg
    };
  },

  d: function(arg: string): {
    bar: string
  } {
    return {
      bar: arg
    };
  },

  // return type annotation may be omitted, but if so, input positions on
  // observed return type (e.g. param types in a function type) must come
  // from annotations
  e: function(arg: string) {
    return function(x) {  // missing param annotation
      return x;
    }
  },

  // ...if the return type is annotated explicitly, this is unnecessary
  f: function(arg: string): (x:number) => number {
    return function(x) {  // no error
      return x;
    }
  }

};

var Bar = {
  a: Foo.a('Foo'),    // no annotation required

  // object property types are inferred, so make sure that this doesn't cause
  // us to also infer the parameter's type.
  b: Foo.b('bar'),    // no annotation required

  c: Foo.c('bar'),            // no annotation required

  d: Foo.d('bar'),            // no annotation required
};

module.exports = Foo, Bar;
