declare class T {}
declare class U {}

declare var a: {...{ p :T },...{ p :U }}; (a: { p?:T|U });
declare var b: {...{ p?:T },...{ p :U }}; (b: { p?:T|U });
declare var c: {...{ p :T },...{ p?:U }}; (c: { p?:T|U });
declare var d: {...{ p?:T },...{ p?:U }}; (d: { p?:T|U });

declare var e: {...{|p :T|},...{ p :U }}; (e: { p :T|U });
declare var f: {...{|p?:T|},...{ p :U }}; (f: { p?:T|U });
declare var g: {...{|p :T|},...{ p?:U }}; (g: { p :T|U });
declare var h: {...{|p?:T|},...{ p?:U }}; (h: { p?:T|U });

declare var i: {...{ p :T },...{|p :U|}}; (i: { p :  U });
declare var j: {...{ p?:T },...{|p :U|}}; (j: { p :  U });
declare var k: {...{ p :T },...{|p?:U|}}; (k: { p?:T|U });
declare var l: {...{ p?:T },...{|p?:U|}}; (l: { p?:T|U });

declare var m: {...{|p :T|},...{|p :U|}}; (m: {|p :  U|});
declare var n: {...{|p?:T|},...{|p :U|}}; (n: {|p :  U|});
declare var o: {...{|p :T|},...{|p?:U|}}; (o: {|p :T|U|});
declare var p: {...{|p?:T|},...{|p?:U|}}; (p: {|p?:T|U|});
