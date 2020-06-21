declare class T {}
declare class U {}

declare var o1: {...{[string]:T},...{p:U}};
(o1: {p?:T|U,[string]:T}); // ok

declare var o2: {...{p:T},...{[string]:U}};
(o2: {p?:T|U,[string]:U}); // ok

declare var o3: {...{[string]:T},...{[string]:U}};
(o3: {[string]:T|U}); // ok

declare var o4: {...{|[string]:T|},...{p:U}};
(o4: {p?:T|U,[string]:T}); // ok

declare var o5: {...{|p:T|},...{[string]:U}};
(o5: {p:T|U,[string]:U}); // ok

declare var o6: {...{|[string]:T|},...{[string]:U}};
(o6: {[string]:T|U}); // ok

declare var o7: {...{[string]:T},...{|p:U|}};
(o7: {p:U,[string]:T}); // ok

declare var o8: {...{p:T},...{|[string]:U|}};
(o8: {p?:T|U,[string]:U}); // ok

declare var o9: {...{[string]:T},...{|[string]:U|}};
(o9: {[string]:T|U}); // ok

declare var o10: {...{|[string]:T|},...{|p:U|}};
(o10: {|p:U,[string]:T|}); // ok

declare var o11: {...{|p :T|},...{|[string]:U|}};
(o11: {|p:T|U,[string]:U|}); // ok

declare var o12: {...{|[string]:T|},...{|[string]:U|}};
(o12: {|[string]:T|U|}); // ok
