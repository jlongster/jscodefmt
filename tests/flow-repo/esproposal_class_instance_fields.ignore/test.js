/* @flow */

class Foo {
  annotationOnly: string;
  initOnly = 'asdf'
  initWithAnnotation: string = 'asdf';
  [computed]: string;
}
