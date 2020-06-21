
let f: <A>((
  (?A) => B
)) => B;


export const testFunctionOnOptionsAsArgument: <T1,a>(?a, ((?a) => T1)) => T1 = function _(Arg1, Arg2) { const result = TypesBS.testFunctionOnOptionsAsArgument((Arg1 == null ? undefined : Arg1), Arg2); return result };
