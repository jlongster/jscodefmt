/** @type {Object} */(myObject.property).someProp = true;
(/** @type {Object} */(myObject.property)).someProp = true;

const prop = /** @type {Object} */(myObject.property).someProp;

const test = /** @type (function (*): ?|undefined) */
      (goog.partial(NewThing.onTemplateChange, rationaleField, typeField));

const test = /** @type (function (*): ?|undefined) */ (goog.partial(NewThing.onTemplateChange, rationaleField, typeField));

const model = /** @type {?{getIndex: Function}} */ (model);

const foo = /** @type {string} */
  (bar);

const test = /** @type (function (*): ?|undefined) */ (foo);
