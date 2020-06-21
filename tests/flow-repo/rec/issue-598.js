/* @flow */

type F<A> = { foo<B>(x: A): F<B> }
declare function foo(x: any): F<any>;
({ foo }: F<any>);

function bar(y: F<number>): F<string> { return y; }
function bar1<X>(y: F<X>): F<any> { return y; }
function bar2<X>(y: F<any>): F<X> { return y; }

type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

function identity<A>(val: A): Functor<A> {
  return {
    map<B>(f: (_: typeof val) => B): Functor<B> { return identity(f(val)) }
  }
}
