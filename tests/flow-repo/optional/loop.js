/* Regression test. Improper handling of OptionalT repositioning can cause
 * reasons to grow "optional x" -> "optional optional x" -> "optional optional
 * optional x", which thwarts reason-based caches that prevent nontermination.
 */
function f<T:*>(x:T,y?:T) { x = y }
