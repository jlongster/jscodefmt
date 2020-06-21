// @noflow

// refinement of disjoint unions

type Empty = { }

type Success = {
  type: 'SUCCESS';
  result: string;
};

type Error = {
  type: 'ERROR';
} & Empty;

export type T = Success | Error;

function foo(x: T) {
  if (x.type === 'SUCCESS') return x.result;
  else return x.result;
}
