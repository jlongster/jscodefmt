const dog = {
  @readonly
  @nonenumerable
  @doubledValue
  legs: 4,

  @readonly
  @nonenumerable
  @doubledValue
  eyes: 2
};

const foo = {
  @multipleDecorators @inline @theyWontAllFitInOneline aVeryLongPropName: "A very long string as value"
};
