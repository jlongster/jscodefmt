interface Some<X> {}
interface Other<X> { x: X; }
interface None<Y> {}
interface Nada<Y> { y: Y }
interface A<X> {
  foo<Y>(s: Some<X>, e: None<Y>): A<Y>;
  foo<Y>(s: Some<X>, e: Nada<Y>): A<Y>;
  foo<Y>(s: Other<X>, e: None<Y>): A<Y>;
  foo<Y>(s: Other<X>, e: Nada<Y>): A<Y>;
}
interface B<X> extends A<X> {
  foo<Y>(s: Some<X>, e: None<Y>): B<Y>;
  foo<Y>(s: Some<X>, e: Nada<Y>): B<Y>;
  foo<Y>(s: Other<X>, e: None<Y>): B<Y>;
  foo<Y>(s: Other<X>, e: Nada<Y>): B<Y>;
}
