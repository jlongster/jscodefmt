/* @flow */

var execFile = require('child_process').execFile;

// args only.
execFile('ls', ['-lh']);

// callback only.
execFile('ls', function(error, stdout, stderr) {
  console.info(stdout);
});

// options only.
execFile('wc', {timeout: 250});

// args + callback.
execFile('ls', ['-l'], function(error, stdout, stderr) {
  console.info(stdout);
});

// args + options.
execFile('ls', ['-l'], {timeout: 250});

// Put it all together.
execFile('ls', ['-l'], {timeout: 250}, function(error, stdout, stderr) {
  console.info(stdout);
});
