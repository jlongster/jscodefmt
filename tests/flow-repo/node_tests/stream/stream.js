/* @flow */

var child_process = require('child_process');
var fs = require('fs');
var stream = require('stream');
var ls = child_process.spawn('ls');

var data = "foo";

ls.stdin.write(data);
ls.stdin.write(data, "utf-8");
ls.stdin.write(data, () => {});
ls.stdin.write(data, "utf-8", () => {});

ls.stdin.end();
ls.stdin.end(data);
ls.stdin.end(data, "utf-8");
ls.stdin.end(data, () => {});
ls.stdin.end(data, "utf-8", () => {});

var ws = fs.createWriteStream('/dev/null');
ls.stdout.pipe(ws).end();

class MyReadStream extends stream.Readable {}
class MyWriteStream extends stream.Writable {}
class MyDuplex extends stream.Duplex {}
class MyTransform extends stream.Duplex {}

new MyReadStream()
  .pipe(new MyDuplex())
  .pipe(new MyTransform())
  .pipe(new MyWriteStream());

new MyReadStream()
  .on('error', () => {})
  .pipe(new MyDuplex())
  .once('close', () => {});
