function foo(x:?string) {}
function bar(x:?number) {}
foo('hmm');
bar('hmm');

function fn(data: ?{}) {}
fn({some: 'literal'});
