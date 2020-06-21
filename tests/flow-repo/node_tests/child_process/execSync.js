/* @flow */

var execSync = require('child_process').execSync;

(execSync('ls'): Buffer); // returns Buffer
(execSync('ls', {encoding: 'buffer'}): Buffer); // returns Buffer
(execSync('ls', {encoding: 'utf8'}): string); // returns string
(execSync('ls', {timeout: '250'})); // error, no signatures match
(execSync('ls', {stdio: 'inherit'})); // error, no signatures match
(execSync('ls', {stdio: ['inherit']})); // error, no signatures match
