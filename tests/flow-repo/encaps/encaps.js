class A { }
var a = new A();
var s1 = `l${a.x}r`; // error: no prop x in A

function tag(strings,...values) {
    var x:number = strings[0]; // error: string ~> number
    return x;
}
var s2 = tag `l${42}r`;

function tag2(strings,...values) {
  return { foo: "" }; // ok: tagged templates can return whatever
}

var s3 = tag2 `la la la`;
(s3.foo: number); // error: string ~> number
