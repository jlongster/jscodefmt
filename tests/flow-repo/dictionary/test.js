type Params = {count: number; [name: string]: string};
type QueryFunction = (params: Params) => string;

var o: { foo: QueryFunction } = {
  foo(params) {
    return params.count; // error, number ~/~ string
  }
};

module.exports = o;
