declare class T {}
declare class U {}

declare var o1: {...{p:T}&{p:U}};
(o1: {p?:T&U}); // ok

declare var o2: {...{p?:T}&{p:U}};
(o2: {p?:T&U}); // ok

declare var o3: {...{p:T}&{p?:U}};
(o3: {p?:T&U}); // ok

declare var o4: {...{p?:T}&{p?:U}};
(o4: {p?:T&U}); // ok

declare var o5: {...{|p:T|}&{p:U}};
(o5: {p:T&U}); // ok

declare var o6: {...{|p?:T|}&{p:U}};
(o6: {p:T&U}); // ok

declare var o7: {...{|p:T|}&{p?:U}};
(o7: {p:T&U}); // ok

declare var o8: {...{|p?:T|}&{p?:U}};
(o8: {p?:T&U}); // ok

declare var o9: {...{p:T}&{|p:U|}};
(o9: {p:T&U}); // ok

declare var o10: {...{p?:T}&{|p:U|}};
(o10: {p:T&U}); // ok

declare var o11: {...{p:T}&{|p?:U|}};
(o11: {p:T&U}); // ok

declare var o12: {...{p?:T}&{|p?:U|}};
(o12: {p?:T&U}); // ok

declare var o13: {...{|p:T|}&{|p:U|}};
(o13: {|p:T&U|}); // ok

declare var o14: {...{|p?:T|}&{|p:U|}};
(o14: {|p:T&U|}); // ok

declare var o15: {...{|p:T|}&{|p?:U|}};
(o15: {|p:T&U|}); // ok

declare var o16: {...{|p?:T|}&{|p?:U|}};
(o16: {|p?:T&U|}); // ok

declare var o17: {...{p:T}&{q:U}};
(o17: {p?:T,q?:U}); // ok

declare var o18: {...{p?:T}&{q:U}};
(o18: {p?:T,q?:U}); // ok

declare var o19: {...{p:T}&{q?:U}};
(o19: {p?:T,q?:U}); // ok

declare var o20: {...{p?:T}&{q?:U}};
(o20: {p?:T,q?:U}); // ok

declare var o21: {...{|p:T|}&{q:U}};
(o21: {p:T,q?:U}); // ok
