// @flow

class Base {
  base_unannotatedField;
  base_annotatedField: number;
  base_initializedField = 42;
  base_initializedFieldWithThis = this.base_initializedField;
  base_annotatedInitializedFieldValid: ?number = 42;
  base_annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number

  static base_unannotatedField;
  static base_annotatedField: number;
  static base_initializedField = 'asdf';
  static base_initializedFieldWithThis = this.base_initializedField;
  static base_annotatedInitializedFieldValid: ?number = 42;
  static base_annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number

  inherited_initializer = 42;
  static inherited_initializer = 42;
}

class Child extends Base {
  child_unannotatedField;
  child_annotatedField: number;
  child_initializedField = 42;
  child_initializedFieldWithThis = this.child_initializedField;
  child_annotatedInitializedFieldValid: ?number = 42;
  child_annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number

  static child_unannotatedField;
  static child_annotatedField: number;
  static child_initializedField = 'asdf';
  static child_initializedFieldWithThis = this.child_initializedField;
  static child_annotatedInitializedFieldValid: ?number = 42;
  static child_annotatedInitializedFieldInvalid: number = 'asdf'; // Error: string ~> number

  inherited_initializer;
  static inherited_initializer;
}

var o = new Child();

/**
 * Unannotated fields are open.
 */
(o.base_unannotatedField: string);
(o.base_unannotatedField: number);
(Child.base_unannotatedField: string);
(Child.base_unannotatedField: number);

(o.child_unannotatedField: string);
(o.child_unannotatedField: number);
(Child.child_unannotatedField: string);
(Child.child_unannotatedField: number);


/**
 * Annotated (but uninitialized) fields still have a type.
 */
(o.base_annotatedField: number);
(o.base_annotatedField: string); // Error: number ~> string
(Child.base_annotatedField: number);
(Child.base_annotatedField: string); // Error: number ~> string

(o.child_annotatedField: number);
(o.child_annotatedField: string); // Error: number ~> string
(Child.child_annotatedField: number);
(Child.child_annotatedField: string); // Error: number ~> string

/**
 * Initialized (but unannotated) fields assume the type of their initializer.
 */
(o.base_initializedField: number);
(o.base_initializedField: string); // Error: number ~> string
(Child.base_initializedField: string);
(Child.base_initializedField: number); // Error: string ~> number

(o.child_initializedField: number);
(o.child_initializedField: string); // Error: number ~> string
(Child.child_initializedField: string);
(Child.child_initializedField: number); // Error: string ~> number

/**
 * Initialized fields can reference `this`.
 */
(o.base_initializedFieldWithThis: number);
(o.base_initializedFieldWithThis: string); // Error: number ~> string
(Child.base_initializedFieldWithThis: string);
(Child.base_initializedFieldWithThis: number); // Error: string ~> number

(o.child_initializedFieldWithThis: number);
(o.child_initializedFieldWithThis: string); // Error: number ~> string
(Child.child_initializedFieldWithThis: string);
(Child.child_initializedFieldWithThis: number); // Error: string ~> number

/**
 * Initialized + annotated fields take the type of the annotation.
 * (Note that this matters when the annotation is more general than the type of
 *  the initializer)
 */
(o.base_annotatedInitializedFieldValid: ?number);
(o.base_annotatedInitializedFieldValid: number); // Error: ?number ~> number
(Child.base_annotatedInitializedFieldValid: ?number);
(Child.base_annotatedInitializedFieldValid: number); // Error: ?number ~> number

(o.child_annotatedInitializedFieldValid: ?number);
(o.child_annotatedInitializedFieldValid: number); // Error: ?number ~> number
(Child.child_annotatedInitializedFieldValid: ?number);
(Child.child_annotatedInitializedFieldValid: number); // Error: ?number ~> number

/**
 * Initialized + annotated fields where the init/annot combo is a mismatch
 * should assume the type of the annotation.
 *
 * (This happens in addition to erroring at the site of initialization)
 */
(o.base_annotatedInitializedFieldInvalid: number);
(o.base_annotatedInitializedFieldInvalid: string); // Error: number ~> string
(Child.base_annotatedInitializedFieldInvalid: number);
(Child.base_annotatedInitializedFieldInvalid: string); // Error: number ~> string

(o.child_annotatedInitializedFieldInvalid: number);
(o.child_annotatedInitializedFieldInvalid: string); // Error: number ~> string
(Child.child_annotatedInitializedFieldInvalid: number);
(Child.child_annotatedInitializedFieldInvalid: string); // Error: number ~> string

/**
 * Derived fields without an initializer that shadow base fields *with* an
 * initializer should have the type of the base field.
 */
(o.inherited_initializer: number);
(o.inherited_initializer: string); // Error: number ~> string
(Child.inherited_initializer: number);
(Child.inherited_initializer: string); // Error: number ~> string
