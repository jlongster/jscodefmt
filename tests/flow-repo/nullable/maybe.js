// @flow

// unwrapping nested maybes should work
(('foo': ?(?string)): ?string); // ok
((123: ?(?number)): ?string); // error (only num ~> string)
