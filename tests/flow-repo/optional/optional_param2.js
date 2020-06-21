declare class I<V> {
    map<M>(
        mapper: (value?: V) => M
    ): I<M>;
}
var i:I<number> = new I();
var j:I<number> = i.map(id => id);
