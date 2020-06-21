/* @flow */

type NoSpaces = "foobar"
("foobar": NoSpaces);

type HasSpaces = "foo bar"
("foo bar": HasSpaces);
