/* @flow */

var child_process = require('child_process');

var ls = child_process.spawn('ls');
var wc = child_process.spawn('wc', ['-l']);

// args + options.
child_process.spawn('echo', ['-n', '"Testing..."'], {env: {TEST: 'foo'}});

// options only.
child_process.spawn('echo', {env: {FOO: 2}});

ls.stdout.on('data', function(data) {
  wc.stdin.write(data);
});

ls.stderr.on('data', function(data) {
  console.warn(data);
});

ls.on('close', function(code) {
  if (code !== 0) {
    console.warn('`ls` exited with code %s', code);
  }
  wc.stdin.end();
});

wc.stdout.pipe(process.stdout);
wc.stderr.pipe(process.stderr);
