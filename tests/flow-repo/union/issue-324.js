/* @flow */
class Foo{};
class Bar{};

var foostr: Foo | string = new Foo();
var barstr: Bar | string = new Bar();

foostr = barstr;
