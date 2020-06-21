var M = require('M');
var N = require('N');
N.x = M(N.x);
var P = require('./P'); // implementation of P redirects to module M
N.y = P(N.y);
var Q = require('Q'); // declaration of Q redirects to module M
N.z = Q(N.z);
