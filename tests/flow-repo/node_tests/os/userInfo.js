/* @flow */

var os = require('os');

var u1 = os.userInfo();
(u1.username: string);
(u1.username: Buffer); // error

var u2 = os.userInfo({encoding: 'utf8'});
(u2.username: string);
(u2.username: Buffer); // error

var u3 = os.userInfo({encoding: 'buffer'});
(u3.username: string); // error
(u3.username: Buffer);
