// @flow

class Base {
  unannotatedField;
  annotatedField: number;
  initializedField = 42;
  initializedFieldWithThis = this.initializedField;
  annotatedInitializedFieldValid: ?number = 42;
  annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number

  static unannotatedField;
  static annotatedField: number;
  static initializedField = 'asdf';
  static initializedFieldWithThis = this.initializedField;
  static annotatedInitializedFieldValid: ?number = 42;
  static annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number
}

var o = new Base();

/**
 * Unannotated fields are open.
 */
(o.unannotatedField: string);
(o.unannotatedField: number);
(Base.unannotatedField: string);
(Base.unannotatedField: number);

/**
 * Annotated (but uninitialized) fields still have a type.
 */
(o.annotatedField: number);
(o.annotatedField: string); // Error: number ~> string
(Base.annotatedField: number);
(Base.annotatedField: string); // Error: number ~> string

/**
 * Initialized (but unannotated) fields assume the type of their initializer.
 */
(o.initializedField: number);
(o.initializedField: string); // Error: number ~> string
(Base.initializedField: string);
(Base.initializedField: number); // Error: string ~> number

/**
 * Initialized fields can reference `this`.
 */
(o.initializedFieldWithThis: number);
(o.initializedFieldWithThis: string); // Error: number ~> string
(Base.initializedFieldWithThis: string);
(Base.initializedFieldWithThis: number); // Error: string ~> number

/**
 * Initialized + annotated fields take the type of the annotation.
 * (Note that this matters when the annotation is more general than the type of
 *  the initializer)
 */
(o.annotatedInitializedFieldValid: ?number);
(o.annotatedInitializedFieldValid: number); // Error: ?number ~> number
(Base.annotatedInitializedFieldValid: ?number);
(Base.annotatedInitializedFieldValid: number); // Error: ?number ~> number

/**
 * Initialized + annotated fields where the init/annot combo is a mismatch
 * should assume the type of the annotation.
 *
 * (This happens in addition to erroring at the site of initialization)
 */
(o.annotatedInitializedFieldInvalid: number);
(o.annotatedInitializedFieldInvalid: string); // Error: number ~> string
(Base.annotatedInitializedFieldInvalid: number);
(Base.annotatedInitializedFieldInvalid: string); // Error: number ~> string
