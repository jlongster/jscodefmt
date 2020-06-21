declare var g1: Generator<string, string, ?string>;
var g2: Generator<?string, ?string, string> = g1;
