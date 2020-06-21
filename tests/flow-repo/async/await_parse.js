async function f() { await 1; }
async function ft<T>(a: T) { await 1; }

class C {
  async m() { await 1; }
  async mt<T>(a: T) { await 1; }
  static async m(a) { await 1; }
  static async mt<T>(a: T) { await 1; }
}

var e = async function () { await 1; };
var et = async function<T> (a: T) { await 1; };

var n = new async function() { await 1; };

var o = { async m() { await 1; } };
var ot = { async m<T>(a: T) { await 1; } };
var oz = { async async(async) { await async; } };

var x = { await : 5 };
console.log(x.await);

var await = 3;
var y = { await };
