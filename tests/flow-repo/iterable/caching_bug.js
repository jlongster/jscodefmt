/* @flow */

/**
 * I've hit a bug with the caching in flow_js.ml. Avik is removing that caching
 * so it should be fixed soon. The basic idea is I flow something like
 *
 * Array<any | any> ~> Iterable<string>
 *
 * then Flow won't notice when I try to flow
 *
 * Array<string | number> ~> Iterable<string>
 *
 * We shouldn't hit the cache because the union types are different, but we do
 * anyway. I've fixed this temporarily by bumping the "meaningful" param to
 * Hashtbl.hash_param
 */

function fill_the_cache(x: Array<any | any>): Iterable<string> { return x; }

// Error: number ~> string
function miss_the_cache(x: Array<string | number>): Iterable<string> { return x; }
