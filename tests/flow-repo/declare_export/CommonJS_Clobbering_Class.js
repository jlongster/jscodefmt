/**
 * @providesModule CommonJS_Clobbering_Class
 * @flow
 */

class Base {
  static baseProp: number;
}

class Test extends Base {
  static childProp: number;

  static staticNumber1():number { return 1; }
  static staticNumber2():number { return 2; }
  static staticNumber3():number { return 3; }

  instNumber1():number { return 1; }
  instNumber2():number { return 2; }
};

module.exports = Test;
