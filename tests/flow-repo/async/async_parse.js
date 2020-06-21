async function f() {}
async function ft<T>(a: T) {}

class C {
  async m() {}
  async mt<T>(a: T) {}
  static async m(a) {}
  static async mt<T>(a: T) {}
}

var e = async function () {};
var et = async function<T> (a: T) {};

var n = new async function() {};

var o = { async m() {} };
var ot = { async m<T>(a: T) {} };
var oz = { async async() {} };

var x = { async : 5 };
console.log(x.async);

var async = 3;
var y = { async };
