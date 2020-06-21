function foo(x: $All<Error,{type:number}>): number {
    return x.type;
}

function bar(x: Error & {type:number}): number {
    return x.type;
}
