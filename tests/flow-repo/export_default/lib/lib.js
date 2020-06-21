declare module M {
    declare function exports(x:string): string;
}
declare module N {
    declare var x: number;
    declare var y: number;
    declare var z: number;
}
declare module Q {
    declare var exports: $Exports<'M'>;
}
