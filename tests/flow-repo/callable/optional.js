type F = {
  (x: string): number;
  p?: string;
}

function f(x) {
  return x.length;
}

(f: F);
